import React, { useState } from 'react';

const SearchBar = ({ onSearch, suggestions, onSuggestionClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick(suggestion);
    setSearchTerm('');
  };

  return (
    <>
      {/* Mobile: Bottom positioned */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <div className="bg-white rounded-full border border-gray-200 shadow-lg">
          <div className="flex items-center px-4 py-3">
            <svg
              className="w-5 h-5 text-gray-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un sport..."
              value={searchTerm}
              onChange={handleInputChange}
              className="flex-1 border-none outline-none text-base text-gray-700 bg-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* Mobile Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-2 bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-3 text-base text-gray-700 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Top positioned */}
      <div className="hidden lg:block absolute top-4 left-1/2 transform -translate-x-1/2 z-40 w-96">
        <div className="relative">
          <div className="bg-white rounded-full border border-gray-200 shadow-lg">
            <div className="flex items-center px-5 py-3">
              <svg
                className="w-5 h-5 text-gray-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un sport ou un équipement..."
                value={searchTerm}
                onChange={handleInputChange}
                className="flex-1 border-none outline-none text-base text-gray-700 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>

          {/* Desktop Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-5 py-3 text-base text-gray-700 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchBar;