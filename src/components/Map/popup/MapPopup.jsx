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
    return equipment.id || 
           equipment.properties?.id || 
           equipment.properties?.gid || 
           equipment.properties?.fid || 
           equipment.properties?.installation_id;
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
    // ✅ UTILISER L'ID AUTO-INCRÉMENTÉ au lieu d'inst_numero
    const reportUrl = `/report?equipmentId=${popupInfo.id}&equipmentName=${encodeURIComponent(popupInfo.properties.name)}&lat=${popupInfo.geometry?.coordinates[1]}&lng=${popupInfo.geometry?.coordinates[0]}`;
    
    console.log('🔗 Redirection vers signalement avec ID auto-incrémenté:', popupInfo.id);
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
          
          {/* Sports */}
          {popupInfo.properties.sports && popupInfo.properties.sports !== "" && (
            <div>
              <p className='text-sm mb-2 font-semibold text-gray-900'>Sport pratiqué :</p>
              <div className='flex flex-wrap p-2 bg-gray-50 rounded-lg border'>
                {backgroundStyleSport(popupInfo.properties.sports)}
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
