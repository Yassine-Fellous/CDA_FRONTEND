import { useState, useEffect } from 'react';

export const useEquipments = () => {
  const [equipments, setEquipments] = useState(null);
  const [errorEquipments, setError] = useState(null);
  const [loadingEquipments, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
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
  }, []);

  return { equipments, errorEquipments, loadingEquipments };
};