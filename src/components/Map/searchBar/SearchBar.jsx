import React from 'react';
import { Search } from 'lucide-react'; // ✅ IMPORTER L'ICÔNE SEARCH

const SearchBar = ({ onSearch, suggestions = [], onSuggestionClick }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    onSuggestionClick(suggestion);
  };

  return (
    <div style={styles.searchBarContainer}>
      {/* ✅ ICÔNE LOUPE À GAUCHE */}
      <Search
        size={20}
        style={{
          color: '#6b7280',
          marginRight: '12px',
          flexShrink: 0, // ✅ EMPÊCHER LA COMPRESSION
        }}
      />

      <input
        type="text"
        placeholder="Rechercher un sport..."
        value={searchTerm}
        onChange={handleInputChange}
        style={styles.searchInput}
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              style={styles.suggestionItem}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles mis à jour
const styles = {
  searchBarContainer: {
    position: 'relative', // ✅ MODIFIER DE absolute À relative
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '25px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '12px 16px', // ✅ AUGMENTER LE PADDING
    width: '100%', // ✅ PRENDRE TOUTE LA LARGEUR DU CONTENEUR
    maxWidth: '500px', // ✅ AUGMENTER LA LARGEUR MAX
    zIndex: 49,
    transition: 'box-shadow 0.2s ease',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#374151', // ✅ COULEUR PLUS FONCÉE
    backgroundColor: 'transparent',
    width: '100%',
    '::placeholder': {
      color: '#9ca3af',
    },
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // ✅ OMBRE PLUS PRONONCÉE
    marginTop: '8px',
    zIndex: 50, // ✅ AU-DESSUS DE LA SEARCH BAR
    maxHeight: '200px',
    overflowY: 'auto',
  },
  suggestionItem: {
    padding: '12px 16px', // ✅ PLUS DE PADDING
    fontSize: '14px',
    color: '#4b5563',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
};

export default SearchBar;