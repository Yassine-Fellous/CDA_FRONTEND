import React from 'react';
import { Popup } from 'react-map-gl';
import { X, Share2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backgroundStyleSport } from '@/utils/backgroundStyleSport'; 
import PopupHeader from './PopupHeader';
import AddressSection from './AddressSection';
import './MapPopup.css';

const MapPopup = ({ popupInfo, onClose }) => {
  const navigate = useNavigate();
  
  if (!popupInfo) return null;

  // Fonction pour obtenir l'ID de l'équipement
  const getEquipmentId = (equipment) => {
    console.log('🔍 DEBUG getEquipmentId - equipment reçu:', equipment);
    
    // ✅ PRIORITÉ AUX DIFFÉRENTES SOURCES D'ID
    const possibleIds = [
      equipment.id,                    // ID depuis MapView
      equipment.properties?.id,        // ID depuis properties
      equipment.properties?.gid,       // ID alternatif
      equipment.properties?.fid,       // ID alternatif
      equipment.properties?.installation_id // ID installation
    ];
    
    console.log('🔍 IDs possibles:', possibleIds);
    
    for (const id of possibleIds) {
      if (id !== undefined && id !== null && id !== '') {
        console.log('✅ ID trouvé:', id, 'Type:', typeof id);
        return id;
      }
    }
    
    console.error('❌ Aucun ID trouvé dans:', equipment);
    return null;
  };

  // Préparer les données de l'équipement pour la page de rapport
  const equipmentData = {
    nom: popupInfo.properties.name,
    adresse: popupInfo.properties.address,
    ville: popupInfo.properties.city,
    coordonnees: {
      latitude: popupInfo.latitude,
      longitude: popupInfo.longitude
    },
    type: popupInfo.properties.type,
    famille: popupInfo.properties.family
  };

  const handleReportClick = () => {
    const equipmentId = getEquipmentId(popupInfo);
    
    if (!equipmentId) {
      alert('ID d\'équipement manquant');
      return;
    }

    const lat = popupInfo.latitude;
    const lng = popupInfo.longitude;
    const equipmentName = popupInfo.properties?.name;

    // ✅ URL AVEC ID AUTO-INCRÉMENTÉ DIRECTEMENT
    const reportUrl = `/report?equipmentId=${equipmentId}&equipmentName=${encodeURIComponent(equipmentName || '')}&lat=${lat}&lng=${lng}`;
    
    console.log('🔗 URL finale:', reportUrl);
    navigate(reportUrl);
  };

  return (
    <Popup
      longitude={popupInfo.longitude}
      latitude={popupInfo.latitude}
      closeButton={false}
      closeOnClick={false}
      onClose={onClose}
      anchor="bottom"
      className="custom-popup"
      offset={[0, -10]}
      maxWidth="none"
    >
      <div className="relative bg-white">
        {/* Header with close button */}
        <div className="relative p-4 border-b border-gray-100">
          <button 
            className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors z-10" 
            onClick={onClose}
          >
            <X size={20} className="text-gray-600" />
          </button>
          
          <button 
            className="absolute top-2 right-12 p-2 rounded-full hover:bg-gray-100 transition-colors z-10" 
            onClick={() => {
              const websiteUrl = `${window.location.origin}/map?equipmentId=${popupInfo.properties.id}&lat=${popupInfo.latitude}&lng=${popupInfo.longitude}&zoom=18`;
              navigator.share({
                title: popupInfo.properties.name,
                text: `Découvrez cet équipement sportif : ${popupInfo.properties.name}`,
                url: websiteUrl,
              }).catch((error) => console.log('Error sharing:', error));
            }}
          >
            <Share2 size={18} className="text-gray-600" />
          </button>
          
          <PopupHeader name={popupInfo.properties.name} onClose={onClose} />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Equipment Type */}
          <div className="space-y-1">
            {popupInfo.properties.family === popupInfo.properties.type ? (
              <p className="text-sm text-gray-800 font-medium">{popupInfo.properties.family}</p>
              ) : (
              <>
                <p className="text-sm text-gray-800 font-medium">{popupInfo.properties.family}</p>
                <p className="text-sm text-gray-600">{popupInfo.properties.type}</p>
              </>
            )}
          </div>
          
          {/* Sports with robust check */}
          {popupInfo.properties.sports && 
            typeof popupInfo.properties.sports === 'string' && 
            popupInfo.properties.sports.trim() !== "" && (
            <div>
              <p className='text-sm mb-2 font-semibold text-gray-900'>Sport pratiqué :</p>
              <div className='flex flex-wrap p-2 bg-gray-50 rounded-lg border'>
                {(() => {
                  try {
                    return backgroundStyleSport(popupInfo.properties.sports);
                  } catch (error) {
                    console.error('Erreur affichage sports:', error);
                    return <span className="text-gray-500">Sports non disponibles</span>;
                  }
                })()}
              </div>
            </div>
          )}

          {/* Free Access */}
          {popupInfo.properties.free_access && popupInfo.properties.free_access !== "" && (
            <div className='flex items-center'>
              <p className='text-sm font-semibold text-gray-900 mr-2'>Accès libre :</p>
              <p className='text-sm text-gray-700'>
                {popupInfo.properties.value === false ? "Non" : "Oui"}
              </p>
            </div>
          )}

          {/* Handicap Access */}
          {typeof popupInfo.properties.inst_acc_handi_bool === 'boolean' && (
            <div className='flex items-center'>
              <p className='text-sm font-semibold text-gray-900 mr-2'>Accès handicapé :</p>
              <p className='text-sm text-gray-700'>
                {popupInfo.properties.inst_acc_handi_bool ? "Oui" : "Non"}
              </p>
            </div>
          )}

          {/* Address */}
          {popupInfo.properties.address && popupInfo.properties.address !== "" && (
            <AddressSection address={popupInfo.properties.address} city={popupInfo.properties.city} />
          )}

          {/* URL */}
          {popupInfo.properties.url && popupInfo.properties.url !== "" && (
            <div className='flex items-center'>
              <a
                href={
                  popupInfo.properties.url.startsWith('http://') || popupInfo.properties.url.startsWith('https://')
                    ? popupInfo.properties.url
                    : `https://${popupInfo.properties.url}`
                }
                className='text-sm font-semibold text-blue-600 hover:text-blue-800 break-all'
                target='_blank'
                rel='noopener noreferrer'
              >
                {popupInfo.properties.url}
              </a>
            </div>
          )}

          {/* Owner */}
          {popupInfo.properties.owner && popupInfo.properties.owner !== "" && (
            <div className='flex items-center'>
              <p className='text-sm font-semibold text-gray-900 mr-2'>Propriétaire :</p>
              <p className='text-sm text-gray-700'>
                {popupInfo.properties.owner}
              </p>
            </div>
          )}

          {/* Management */}
          {popupInfo.properties.gestion && popupInfo.properties.gestion !== "" && (
            <div>
              <p className='text-sm font-semibold text-gray-900 mb-1'>Gestionnaire :</p>
              <p className='text-sm text-gray-700'>
                {popupInfo.properties.gestion}
              </p>
            </div>
          )}
          
          {/* Report Issue Button - Mobile Only */}
          <div className="pt-2 block lg:hidden">
            <button
              onClick={handleReportClick}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 hover:bg-red-100 transition-colors"
            >
              <AlertTriangle size={16} className="mr-2" />
              <span className="text-sm font-medium">Signaler un problème</span>
            </button>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default MapPopup;
