#!/bin/bash
# filepath: /Users/sofiane/Dev/Projet_Titre/Sport_Map_frontend/migrate-pages.sh

echo "📦 Migration des pages..."

# Créer le dossier pages s'il n'existe pas
mkdir -p src/pages

# Déplacer les pages
mv src/components/HomePage.jsx src/pages/
mv src/components/AboutPage.jsx src/pages/
mv src/components/AuthPage.jsx src/pages/
mv src/components/SportsPage.jsx src/pages/
mv src/components/VerificationPage.jsx src/pages/

# Créer MapPage.jsx (renommer MapView.jsx)
mv src/components/Map/MapView.jsx src/pages/MapPage.jsx

# Créer les exports
cat > src/pages/index.js << 'EOF'
export { default as HomePage } from './HomePage';
export { default as AboutPage } from './AboutPage';
export { default as AuthPage } from './AuthPage';
export { default as SportsPage } from './SportsPage';
export { default as MapPage } from './MapPage';
export { default as VerificationPage } from './VerificationPage';
EOF

echo "✅ Pages migrées"