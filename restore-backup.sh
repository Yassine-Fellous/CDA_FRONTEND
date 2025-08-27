#!/bin/bash
# filepath: /Users/sofiane/Dev/Projet_Titre/Sport_Map_frontend/fix-pages-imports.sh

echo "🔧 Correction des imports dans toutes les pages..."

# Fichiers à corriger
PAGES=(
    "src/pages/SportsPage.jsx"
    "src/pages/AuthPage.jsx"
    "src/pages/HomePage.jsx"
    "src/pages/AboutPage.jsx"
    "src/pages/VerificationPage.jsx"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "📝 Correction de $page..."
        
        # Sauvegarder le fichier original
        cp "$page" "${page}.backup"
        
        # Corriger les imports hooks avec alias @
        sed -i '' 's|from "@/hooks/|from "../hooks/|g' "$page"
        
        # Corriger LoadingSpinner
        sed -i '' 's|from "./LoadingSpinner"|from "../components/ui"|g' "$page"
        sed -i '' 's|from "../LoadingSpinner"|from "../components/ui"|g' "$page"
        
        # Corriger d'autres imports potentiels avec alias @
        sed -i '' 's|from "@/components/|from "../components/|g' "$page"
        sed -i '' 's|from "@/utils/|from "../utils/|g' "$page"
        sed -i '' 's|from "@/services/|from "../services/|g' "$page"
        
        echo "✅ $page corrigé"
    else
        echo "⚠️  $page introuvable"
    fi
done

echo "✅ Correction des imports terminée"