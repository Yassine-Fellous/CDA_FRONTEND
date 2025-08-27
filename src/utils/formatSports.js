// Desc: Format sports string to display them in a nice way
export const formatSports = (sports) => {
  if (!sports) return 'Non spécifié';
  const regex = /'([^']*)'|"([^"]*)"/g;
  const sportsArray = sports.match(regex);
  if (!sportsArray) return 'Non spécifié';
  return sportsArray.map(sport => sport.replace(/['"]+/g, '')).join(', ');
  // return backgroundStyleSport(sportsArray.map(sport => sport.replace(/['"]+/g, '')).join(', '));
};