#!/bin/bash
echo "🧹 Nettoyage de l'architecture SportMap..."

echo "Suppression des pages dupliquées..."
rm -f src/components/HomePage.jsx
rm -f src/components/AboutPage.jsx  
rm -f src/components/SportsPage.jsx

echo "Suppression de la navigation dupliquée..."
rm -f src/components/features/navigation/Navigation.jsx

echo "Suppression des versions de test MapPopup..."
rm -f src/components/Map/popup/MapPopup_TEST.jsx
rm -f src/components/Map/popup/MapPopup_fixed.jsx
rm -f src/components/Map/popup/MapPopup_backup.jsx

echo "Suppression du hook auth dupliqué..."
rm -f src/hooks/useAuth.js

echo "Suppression des éléments vides..."
rm -rf src/components/pages/
rm -f src/components/features/map/MapPopup.jsx

find src -type d -empty -delete

echo "✅ Nettoyage terminé !"
echo "�� Structure nettoyée, prête pour la reconstruction."
