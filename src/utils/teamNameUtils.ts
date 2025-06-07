
export const getTeamAbbreviation = (teamName: string): string => {
  if (!teamName) return 'TBD';
  
  // Handle common patterns and create abbreviations
  const words = teamName.trim().split(/\s+/);
  
  // For single word teams, take first 3 characters
  if (words.length === 1) {
    return teamName.slice(0, 3).toUpperCase();
  }
  
  // For multiple words, take first letter of each significant word
  const significantWords = words.filter(word => 
    !['FC', 'SC', 'CF', 'AC', 'United', 'City', 'Town', 'Athletic'].includes(word)
  );
  
  // If we filtered out too much, use original words
  const wordsToUse = significantWords.length > 0 ? significantWords : words;
  
  // Take first letter of each word, max 3 letters
  return wordsToUse
    .slice(0, 3)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

export const shouldUseAbbreviation = (teamName: string, maxLength: number = 12): boolean => {
  return teamName.length > maxLength;
};
