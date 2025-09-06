import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Map, { Source, Layer } from 'react-map-gl';
import { ToggleLeft, ToggleRight, Filter } from 'lucide-react';

// Constants
import { MAPBOX_TOKEN, INITIAL_VIEW_STATE } from '@/constants/mapConfig';

// Hooks
import { useEquipments } from '@/hooks/useEquipments';
import { useSports } from '@/hooks/useSports';

// Components
import MapPopup from './popup/MapPopup';
import { LoadingSpinner } from '../LoadingSpinner';
import SearchBar from './searchBar/SearchBar';
import { clusterLayer, clusterCountLayer, unclusteredPointLayer, sportIconLayer } from './layers';

// Utils
import { formatSports } from '@/utils/formatSports'; // ✅ AJOUTER CETTE LIGNE

// Styles
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapView() {
  const [searchParams] = useSearchParams();
  const sportParam = searchParams.get('sport');
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [styleLoaded, setStyleLoaded] = useState(false);
  
  // ✅ HOOK SIMPLIFIÉ
  const { equipments, errorEquipments, loadingEquipments } = useEquipments();
  const { sports, errorSports, loadingSports } = useSports();
  const [popupInfoEquipment, setPopupInfoEquipment] = useState(null);
  const [filteredEquipments, setFilteredEquipments] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]); // State to track active filters
  const [showFreeAccessOnly, setShowFreeAccessOnly] = useState(false);
  const [showHandicapAccessOnly, setShowHandicapAccessOnly] = useState(false);
  const [showFiltersPopup, setShowFiltersPopup] = useState(false);
  const [showSportsPopup, setShowSportsPopup] = useState(false); // ✅ AJOUTER CETTE LIGNE

  const handleSuggestionClick = (suggestion) => {
    console.log('🔍 DEBUG handleSuggestionClick - suggestion:', suggestion);
    console.log('🔍 DEBUG handleSuggestionClick - typeof suggestion:', typeof suggestion);
    console.log('🔍 DEBUG handleSuggestionClick - activeFilters avant:', activeFilters);
    
    // Add the selected suggestion to active filters
    if (!activeFilters.includes(suggestion)) {
      const newFilters = [...activeFilters, suggestion];
      console.log('🔍 DEBUG handleSuggestionClick - nouveaux filtres:', newFilters);
      setActiveFilters(newFilters);
    }
    // Clear suggestions
    setSearchSuggestions([]);
  };

  useEffect(() => {
    if (sportParam && sports?.includes(sportParam)) {
      handleSuggestionClick(sportParam);
    }

    // Handle URL parameters for shared equipment
    const equipmentId = searchParams.get('equipmentId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');

    if (equipmentId && lat && lng && equipments) {
      // Find the equipment in the data
      const equipment = equipments.features.find(
        feature => feature.properties.id === equipmentId
      );

      if (equipment) {
        // Set the popup info
        setPopupInfoEquipment({
          longitude: parseFloat(lng),
          latitude: parseFloat(lat),
          properties: equipment.properties
        });

        // Update the map view
        setViewState({
          ...viewState,
          longitude: parseFloat(lng),
          latitude: parseFloat(lat),
          zoom: zoom ? parseFloat(zoom) : 18
        });
      }
    }
  }, [sportParam, sports, equipments, searchParams]);

  if (errorEquipments) {
    return <div>Error loading map data</div>;
  }

  if (loadingEquipments) {
    return <LoadingSpinner />;
  }

  const onClick = (event) => {
    const feature = event.features?.[0];
    if (feature && feature.layer.id === 'unclustered-point') {
      const equipmentId = feature.properties?.id || feature.id;
      const longitude = feature.geometry.coordinates[0];
      const latitude = feature.geometry.coordinates[1];
      
      console.log('🎯 Clic équipement:', { equipmentId, longitude, latitude });
      
      // ✅ DÉTECTER SI ON EST SUR DESKTOP
      const isDesktop = window.innerWidth >= 1024;
      console.log('🖥️ Desktop detecté:', isDesktop);
      
      if (!isDesktop) {
        // Mobile/Tablette
        let offset;
        if (window.innerWidth <= 768) {
          offset = 0.004;
        } else {
          offset = 0.015;
        }
        
        setViewState(prevState => ({
          ...prevState,
          longitude: longitude,
          latitude: latitude + offset,
          transitionDuration: 600
        }));
      } else {
        // Desktop : centrage direct
        setViewState(prevState => ({
          ...prevState,
          longitude: longitude,
          latitude: latitude,
          transitionDuration: 400
        }));
      }
      
      // ✅ AFFICHER LA POPUP/SIDEBAR
      setPopupInfoEquipment({
        longitude: longitude,
        latitude: latitude,
        properties: {
          ...feature.properties,
          id: equipmentId  // ✅ S'ASSURER QUE L'ID EST DANS properties
        },
        id: equipmentId,  // ✅ ET AUSSI EN TANT QUE PROPRIÉTÉ DIRECTE
        geometry: feature.geometry
      });
      
      console.log('✅ Popup info définie:', { 
        equipmentId, 
        isDesktop,
        'feature.properties.id': feature.properties.id,
        'equipmentId final': equipmentId
      });
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredEquipments(null);
      setSearchSuggestions([]);
      return;
    }
    if (searchTerm.length < 2) {
      setFilteredEquipments(null);
      setSearchSuggestions([]);
      return;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Filter sports for autocomplete suggestions
    const suggestions = sports.filter(sport =>
      sport.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedSearchTerm)
    );
    console.log('Suggestions:', suggestions);
    setSearchSuggestions(suggestions);
  };

  const handleRemoveFilter = (filterToRemove) => {
    // Remove the filter from active filters
    setActiveFilters(activeFilters.filter(filter => filter !== filterToRemove));
  };

  const getFilteredFeatures = () => {
    let features = equipments.features;
    
    // Apply active filters
    if (activeFilters.length > 0) {
      features = features.filter(feature => {
        const sportsProperty = feature.properties.sports;
        let equipmentSports = [];
        
        if (Array.isArray(sportsProperty)) {
          equipmentSports = sportsProperty;
        } else if (typeof sportsProperty === 'string') {
          const formattedSports = formatSports(sportsProperty);
          if (formattedSports === 'Non spécifié') {
            return false;
          }
          equipmentSports = formattedSports.split(', ').map(s => s.trim());
        } else {
          return false;
        }
        
        const hasMatch = activeFilters.some(filter => 
          equipmentSports.some(sport => {
            const sportLower = sport.toLowerCase();
            const filterLower = filter.toLowerCase();
            return sportLower.includes(filterLower) || filterLower.includes(sportLower);
          })
        );
        
        return hasMatch;
      });
      
      // ✅ RÉDUIRE LES LOGS - SEULEMENT SI NÉCESSAIRE
      if (features.length !== equipments.features.length) {
        console.log(`🔍 ${features.length}/${equipments.features.length} équipements après filtrage`);
      }
    }

    // Apply free access filter
    if (showFreeAccessOnly) {
      features = features.filter(feature => {
        const freeAccess = feature.properties.free_access;
        return freeAccess === true || freeAccess === 'true' || freeAccess === 'Oui';
      });
    }

    // Apply handicap access filter
    if (showHandicapAccessOnly) {
      features = features.filter(feature => {
        const handicapAccess = feature.properties.inst_acc_handi_bool;
        return handicapAccess === true;
      });
    }

    return {
      ...equipments,
      features: features
    };
  };

  // Add this function to handle map load
  const onMapLoad = (event) => {
    const map = event.target;
    setStyleLoaded(true);
    
    // ✅ ÉCOUTEUR POUR TOUTES LES IMAGES MANQUANTES
    map.on('styleimagemissing', (e) => {
      const id = e.id;
      console.log('🔍 Image manquante:', id);
      
      // ✅ CRÉER TOUTES LES IMAGES MANQUANTES DYNAMIQUEMENT
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (id.includes('rectangle-yellow')) {
        // Images rectangles jaunes pour les clusters
        canvas.width = 40;
        canvas.height = 20;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(0, 0, 40, 20);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 40, 20);
      } else if (id === 'map-pin') {
        // Pin par défaut
        canvas.width = 30;
        canvas.height = 30;
        ctx.beginPath();
        ctx.arc(15, 15, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#3498DB';
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (id === 'map-pin-active') {
        // Pin actif
        canvas.width = 30;
        canvas.height = 30;
        ctx.beginPath();
        ctx.arc(15, 15, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (id === 'map-pin-green') {
        // Pin vert pour desktop
        canvas.width = 30;
        canvas.height = 30;
        ctx.beginPath();
        ctx.arc(15, 15, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Image générique pour tout autre cas
        canvas.width = 20;
        canvas.height = 20;
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(0, 0, 20, 20);
      }
      
      try {
        map.addImage(id, canvas);
        console.log('✅ Image créée:', id);
      } catch (error) {
        console.warn('⚠️ Erreur création image:', id, error);
      }
    });

    // ✅ CRÉER LES IMAGES PRINCIPALES UNE SEULE FOIS
    const createMainImages = () => {
      try {
        // Pin par défaut
        if (!map.hasImage('map-pin')) {
          const canvas1 = document.createElement('canvas');
          const ctx1 = canvas1.getContext('2d');
          canvas1.width = 30;
          ctx1.height = 30;
          ctx1.beginPath();
          ctx1.arc(15, 15, 12, 0, 2 * Math.PI);
          ctx1.fillStyle = '#3498DB';
          ctx1.fill();
          ctx1.strokeStyle = '#2980b9';
          ctx1.lineWidth = 2;
          ctx1.stroke();
          map.addImage('map-pin', canvas1);
          console.log('✅ map-pin créé');
        }

        // Pin actif
        if (!map.hasImage('map-pin-active')) {
          const canvas2 = document.createElement('canvas');
          const ctx2 = canvas2.getContext('2d');
          canvas2.width = 30;
          ctx2.height = 30;
          ctx2.beginPath();
          ctx2.arc(15, 15, 12, 0, 2 * Math.PI);
          ctx2.fillStyle = '#e74c3c';
          ctx2.fill();
          ctx2.strokeStyle = '#c0392b';
          ctx2.lineWidth = 2;
          ctx2.stroke();
          map.addImage('map-pin-active', canvas2);
          console.log('✅ map-pin-active créé');
        }

        // Pin vert pour desktop
        if (!map.hasImage('map-pin-green')) {
          const canvas3 = document.createElement('canvas');
          const ctx3 = canvas3.getContext('2d');
          canvas3.width = 30;
          ctx3.height = 30;
          ctx3.beginPath();
          ctx3.arc(15, 15, 12, 0, 2 * Math.PI);
          ctx3.fillStyle = '#22c55e';
          ctx3.fill();
          ctx3.strokeStyle = '#16a34a';
          ctx3.lineWidth = 2;
          ctx3.stroke();
          map.addImage('map-pin-green', canvas3);
          console.log('✅ map-pin-green créé');
        }
        
      } catch (error) {
        console.error('❌ Erreur création images principales:', error);
      }
    };

    // Créer les images après un délai pour éviter les conflits
    setTimeout(createMainImages, 100);
  };

  // Update the unclusteredPointLayer to use different icons based on active state
  const getUnclusteredPointLayer = () => {
    const isDesktop = window.innerWidth >= 1024;
    const selectedId = popupInfoEquipment?.properties?.id || popupInfoEquipment?.id;
    
    // ✅ RÉDUIRE LES LOGS POUR AMÉLIORER LES PERFORMANCES
    if (selectedId) {
      console.log('🔍 Point sélectionné:', selectedId, 'Desktop:', isDesktop);
    }
    
    return {
      ...unclusteredPointLayer,
      paint: {
        ...unclusteredPointLayer.paint,
        'icon-color': [
          'case',
          ['==', ['get', 'id'], selectedId || ''],
          isDesktop ? '#22c55e' : '#e74c3c',
          '#3498DB'
        ],
        'icon-halo-color': '#ffffff',
        'icon-halo-width': [
          'case',
          ['==', ['get', 'id'], selectedId || ''],
          3,
          2
        ]
      },
      layout: {
        ...unclusteredPointLayer.layout,
        'icon-image': 'map-pin', // ✅ TOUJOURS UTILISER LA MÊME IMAGE
        'icon-size': [
          'case',
          ['==', ['get', 'id'], selectedId || ''],
          0.5, // Plus grand quand sélectionné
          0.3  // Taille normale
        ]
      }
    };
  };

  const toggleContainerStyle = {
    position: 'absolute',
    top: '80px',
    left: '10px',
    backgroundColor: 'white',
    padding: '4px 8px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'black',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    // ✅ VERSIONS SIMPLIFIÉES
    WebkitUserSelect: 'none',
    userSelect: 'none'
  };

  const toggleIconStyle = {
    display: 'flex',
    alignItems: 'center',
    color: showFreeAccessOnly ? '#3498db' : 'grey',
    transition: 'color 0.2s ease',
    '@media (maxWidth: 768px)': {
      transform: 'scale(1.2)',
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Top Right Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '10px',
        display: 'flex',
        gap: '8px',
        zIndex: 49,
      }}>
        {/* Sports Button */}
        <div 
          style={{
            backgroundColor: activeFilters.length > 0 ? '#3b82f6' : 'white',
            color: activeFilters.length > 0 ? 'white' : 'black',
            padding: '8px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
          }}
          onClick={() => setShowSportsPopup(!showSportsPopup)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '20px' }}>⚽</span>
            {activeFilters.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
              }}>
                {activeFilters.length}
              </div>
            )}
          </div>
        </div>

        {/* Filter Button */}
        <div 
          style={{
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
          onClick={() => setShowFiltersPopup(true)}
        >
          <Filter size={24} color="black" />
        </div>
      </div>

      {/* Filters Bottom Sheet */}
      {showFiltersPopup && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30%',
            backgroundColor: 'white',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
            zIndex: 49,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '46px',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
            <div style={{ position: 'absolute', width: '100%', textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 600, color: '#000000' }}>Filtres</h3>
            </div>
            <button
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: '1px solid #000000',
                borderRadius: '10px',
                background: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                }
              }}
              onClick={() => setShowFiltersPopup(false)}
            >
              ×
            </button>
          </div>

          {/* Filter Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Free Access Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#000000' }}>Libre accès</span>
                <div 
                  onClick={() => setShowFreeAccessOnly(!showFreeAccessOnly)} 
                  style={{ 
                    cursor: 'pointer',
                    width: '60px',
                    height: '24px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #000000',
                    borderRadius: '12px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    color: '#000000',
                    position: 'absolute',
                    left: showFreeAccessOnly ? '8px' : 'auto',
                    right: showFreeAccessOnly ? 'auto' : '8px'
                  }}>
                    {showFreeAccessOnly ? 'On' : 'Off'}
                  </span>
                <div 
                  style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    backgroundColor: showFreeAccessOnly ? '#3498db' : '#ff9f43',
                    borderRadius: '50%',
                    top: '1px',
                    left: showFreeAccessOnly ? '37px' : '2px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </div>

            {/* Separator Line */}
            <div style={{ 
              width: '100%', 
              height: '1px', 
              backgroundColor: '#E5E7EB',
              margin: '0 auto'
            }} />

            {/* Handicap Access Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#000000' }}>Accès handicapé</span>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v8"/>
                  <path d="M8 12h8"/>
                </svg>
              </div>
              <div 
                onClick={() => setShowHandicapAccessOnly(!showHandicapAccessOnly)} 
                style={{ 
                  cursor: 'pointer',
                  width: '60px',
                  height: '24px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #000000',
                  borderRadius: '12px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <span style={{ 
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#000000',
                  position: 'absolute',
                  left: showHandicapAccessOnly ? '8px' : 'auto',
                  right: showHandicapAccessOnly ? 'auto' : '8px'
                }}>
                  {showHandicapAccessOnly ? 'On' : 'Off'}
                </span>
                <div 
                  style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    backgroundColor: showHandicapAccessOnly ? '#3498db' : '#ff9f43',
                    borderRadius: '50%',
                    top: '1px',
                    left: showHandicapAccessOnly ? '37px' : '2px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sports Selection Popup */}
      {showSportsPopup && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: activeFilters.length > 0 ? '40%' : '35%',
            backgroundColor: 'white',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
            zIndex: 49,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Header */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
            <div style={{ position: 'absolute', width: '100%', textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 600, color: '#000000' }}>
                Sports sélectionnés {activeFilters.length > 0 && `(${activeFilters.length})`}
              </h3>
            </div>
            <button
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: '1px solid #000000',
                borderRadius: '10px',
                background: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.2s ease',
              }}
              onClick={() => setShowSportsPopup(false)}
            >
              ×
            </button>
          </div>

          {/* Content */}
          {activeFilters.length > 0 ? (
            <>
              {/* Clear All Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setActiveFilters([]);
                    setShowSportsPopup(false);
                  }}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                  🗑️ Tout effacer
                </button>
              </div>

              {/* Sports List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '8px',
              }}>
                {activeFilters.map((filter, index) => (
                  <div key={index} style={{
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        color: '#1e293b',
                        fontWeight: '600',
                        fontSize: '14px',
                        lineHeight: '1.4',
                      }}>
                        {filter.length > 30 ? `${filter.substring(0, 30)}...` : filter}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginLeft: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#dc2626';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ef4444';
                        e.target.style.transform = 'scale(1)';
                      }}
                      title={`Supprimer "${filter}"`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Empty State */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#374151' }}>
                Aucun sport sélectionné
              </h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Utilisez la barre de recherche pour filtrer par sport
              </p>
            </div>
          )}
        </div>
      )}

      <Map
        style={{ 
          width: '100vw', 
          height: '100vh',
          // ✅ SUPPRIMER LA MARGE - PAS DE DÉCALAGE
          // marginLeft: (window.innerWidth >= 1024 && popupInfoEquipment) ? '400px' : '0',
          // transition: 'margin-left 0.3s ease'
        }}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={onClick}
        onLoad={onMapLoad}
        onError={(e) => console.error('Map style loading error:', e)}
      >
        {/* SearchBar Component with adjusted style */}
        <div style={{ 
          position: 'absolute', 
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 120px)', // Adjust width to leave space for filter button
          zIndex: 49 
        }}>
          <SearchBar
            onSearch={handleSearch}
            suggestions={searchSuggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>

        {/* Map Layers */}
        {styleLoaded && (
          <Source
            id="equipments"
            type="geojson"
            data={filteredEquipments || getFilteredFeatures()}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={35}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...getUnclusteredPointLayer()} key={popupInfoEquipment?.properties?.id || 'default'} />
            <Layer {...sportIconLayer} />
          </Source>
        )}

        {/* Map Popup */}
        <MapPopup
          popupInfo={popupInfoEquipment}
          onClose={() => setPopupInfoEquipment(null)}
        />
      </Map>
    </div>
  );
}