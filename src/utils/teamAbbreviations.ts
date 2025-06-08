
/**
 * Generates team abbreviations for mobile display
 */
export const generateTeamAbbreviation = (teamName: string): string => {
  if (!teamName) return 'TM';
  
  // Handle special cases and common team name patterns
  const specialCases: Record<string, string> = {
    'Manchester United': 'MAN U',
    'Manchester City': 'MAN C',
    'Real Madrid': 'RMA',
    'FC Barcelona': 'BAR',
    'Bayern Munich': 'BAY',
    'Paris Saint-Germain': 'PSG',
    'Borussia Dortmund': 'BVB',
    'Atlético Madrid': 'ATM',
    'Tottenham Hotspur': 'TOT',
    'Leicester City': 'LEI',
    'West Ham United': 'WHU',
    'Newcastle United': 'NEW',
    'Brighton & Hove Albion': 'BHA',
    'Crystal Palace': 'CRY',
    'Wolverhampton Wanderers': 'WOL',
    'Sheffield United': 'SHU',
    'Norwich City': 'NOR',
    'Aston Villa': 'AVL'
  };
  
  // Check for special cases first
  if (specialCases[teamName]) {
    return specialCases[teamName];
  }
  
  // Remove common prefixes and suffixes
  let cleanName = teamName
    .replace(/^(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|1\.|Sporting|Club|Real|Athletic|Atlético|Borussia)\s+/i, '')
    .replace(/\s+(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|United|City|Town|Rovers|Wanderers|Athletic|Albion|Palace|Villa|County|Borough|Rangers|Celtic|Hotspur|Wednesday|Saturday|Sunday|Monday|Tuesday|Thursday|Friday)$/i, '');
  
  // Split into words and create abbreviation
  const words = cleanName.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 3 characters
    return words[0].substring(0, 3).toUpperCase();
  } else if (words.length === 2) {
    // Two words: take first 2 chars of first word + first char of second word
    return (words[0].substring(0, 2) + words[1].substring(0, 1)).toUpperCase();
  } else {
    // Three or more words: take first char of first 3 words
    return words.slice(0, 3).map(word => word.charAt(0)).join('').toUpperCase();
  }
};
