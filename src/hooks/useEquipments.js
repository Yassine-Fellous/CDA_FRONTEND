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
        console.log('Equipments:', data); 
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