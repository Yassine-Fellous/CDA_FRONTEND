import {formatSports} from './formatSports';

export const backgroundStyleSport = (sports) => {
    if (!sports) return [];
  
    const colors = [
      'bg-green-300',
      'bg-orange-300',
      'bg-yellow-300',
      'bg-blue-300',
      'bg-teal-300',
      'bg-red-300',
      'bg-purple-300',
      'bg-pink-300',
      'bg-indigo-300',
      'bg-gray-300'
    ];
    sports = formatSports(sports);
    return sports.split(',').map((sport, index) => {
      const trimmedSport = sport.trim();
      const colorClass = colors[index % colors.length]; // Cycle through colors if more than 10 sports
      return (
        <span key={trimmedSport} className={`px-2 py-1 m-1 text-white rounded-xl ${colorClass}`}>
          {trimmedSport}
        </span>
      );
    });
  };