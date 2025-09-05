import { useState, useEffect } from 'react';

export const useEquipments = () => {
  const [equipments, setEquipments] = useState(null);
  const [errorEquipments, setError] = useState(null);
  const [loadingEquipments, setLoading] = useState(true);
  const [idMapping, setIdMapping] = useState(new Map()); // ✅ NOUVEAU : Table de correspondance

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // ✅ Charger d'abord la correspondance des IDs
    const loadMapping = async () => {
      try {
        const response = await fetch(`${apiUrl}/installations/`); // Votre endpoint qui renvoie la liste avec id + inst_numero
        const installations = await response.json();
        
        const mapping = new Map();
        installations.forEach(installation => {
          // inst_numero → id
          mapping.set(installation.inst_numero, installation.id);
        });
        
        setIdMapping(mapping);
        console.log('✅ Correspondance ID chargée:', mapping.size, 'entrées');
        console.log('🔍 Exemple:', mapping.get('I130010014'), '← ID pour I130010014');
        
      } catch (error) {
        console.error('❌ Erreur chargement correspondance:', error);
      }
    };

    // Charger les équipements GeoJSON
    const loadEquipments = () => {
      fetch(`${apiUrl}/geojson/`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => {
          console.log('🔍 DEBUG - Structure des équipements:', data);
          if (data.features && data.features.length > 0) {
            console.log('🔍 DEBUG - Premier équipement:', data.features[0]);
            console.log('🔍 DEBUG - Properties du premier:', data.features[0].properties);
            console.log('🔍 DEBUG - ID disponibles:', {
              id: data.features[0].id,
              properties_id: data.features[0].properties.id,
              properties_gid: data.features[0].properties.gid,
              properties_fid: data.features[0].properties.fid
            });
          }
          setEquipments(data);
          setLoading(false);
        })
        .catch(error => {
          setError(error);
          setLoading(false);
        });
    };

    // Exécuter les deux chargements
    loadMapping();
    loadEquipments();
  }, []);

  // ✅ NOUVELLE FONCTION : Convertir inst_numero en ID auto-incrémenté
  const getIdFromInstNumero = (instNumero) => {
    return idMapping.get(instNumero) || null;
  };

  return { 
    equipments, 
    errorEquipments, 
    loadingEquipments, 
    getIdFromInstNumero // ✅ Exposer la fonction de conversion
  };
};