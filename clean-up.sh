#!/bin/bash
# Script de nettoyage des doublons

echo "🧹 Nettoyage des fichiers en doublon..."

# Pages dupliquées
echo "Suppression des pages dupliquées..."
rm -f Sport_Map_frontend/src/components/HomePage.jsx
rm -f Sport_Map_frontend/src/components/AboutPage.jsx  
rm -f Sport_Map_frontend/src/components/SportsPage.jsx

# Hooks dupliqués
echo "Suppression des hooks dupliqués..."
rm -f Sport_Map_frontend/src/hooks/useAuth.js

# Navigation dupliquée
echo "Suppression de la navigation dupliquée..."
rm -f Sport_Map_frontend/src/components/features/navigation/Navigation.jsx

# MapPopup multiples
echo "Suppression des versions de test MapPopup..."
rm -f Sport_Map_frontend/src/components/Map/popup/MapPopup_TEST.jsx
rm -f Sport_Map_frontend/src/components/Map/popup/MapPopup_fixed.jsx
rm -f Sport_Map_frontend/src/components/Map/popup/MapPopup_backup.jsx

# Pages Report dupliquées
echo "Suppression du dossier Report dupliqué..."
rm -rf Sport_Map_frontend/src/components/pages/

# MapPopup vide
echo "Suppression des fichiers vides..."
rm -f Sport_Map_frontend/src/components/features/map/MapPopup.jsx

# Dossiers vides
echo "Suppression des dossiers vides..."
find Sport_Map_frontend/src -type d -empty -delete

echo "✅ Nettoyage terminé !"
echo "📝 N'oubliez pas de corriger les imports dans App.jsx et SportsPage.jsx"