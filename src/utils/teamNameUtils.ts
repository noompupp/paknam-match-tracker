
export const shortenTeamName = (teamName: string, maxLength: number = 12): string => {
  if (!teamName || teamName.length <= maxLength) return teamName;
  
  // Common football team name patterns
  const patterns = [
    { regex: /\b(Football Club|FC)\b/gi, replacement: 'FC' },
    { regex: /\b(Association|Assoc)\b/gi, replacement: 'A' },
    { regex: /\b(United)\b/gi, replacement: 'Utd' },
    { regex: /\b(Athletic)\b/gi, replacement: 'Ath' },
    { regex: /\b(Rangers)\b/gi, replacement: 'R' },
    { regex: /\b(City)\b/gi, replacement: 'C' },
    { regex: /\b(Town)\b/gi, replacement: 'T' },
    { regex: /\b(Rovers)\b/gi, replacement: 'R' },
    { regex: /\b(Wanderers)\b/gi, replacement: 'W' },
    { regex: /\b(International)\b/gi, replacement: 'Int' }
  ];
  
  let shortened = teamName;
  
  // Apply common abbreviations
  patterns.forEach(pattern => {
    shortened = shortened.replace(pattern.regex, pattern.replacement);
  });
  
  // If still too long, truncate intelligently
  if (shortened.length > maxLength) {
    // Try to break at word boundaries
    const words = shortened.split(' ');
    if (words.length > 1) {
      // Take first letters of each word if multiple words
      shortened = words.map(word => word.charAt(0)).join('');
      if (shortened.length > maxLength) {
        shortened = shortened.substring(0, maxLength);
      }
    } else {
      // Single word - truncate with ellipsis
      shortened = shortened.substring(0, maxLength - 1) + '…';
    }
  }
  
  return shortened;
};

// Enhanced compact team name generation with better logic
export const generateCompactTeamName = (teamName: string): string => {
  if (!teamName) return 'TM';
  
  // Premier League and major European clubs
  const eliteClubMappings: Record<string, string> = {
    'Manchester United': 'MUN',
    'Manchester City': 'MCI', 
    'Liverpool': 'LIV',
    'Chelsea': 'CHE',
    'Arsenal': 'ARS',
    'Tottenham Hotspur': 'TOT',
    'Newcastle United': 'NEW',
    'West Ham United': 'WHU',
    'Leicester City': 'LEI',
    'Brighton & Hove Albion': 'BHA',
    'Crystal Palace': 'CRY',
    'Aston Villa': 'AVL',
    'Wolverhampton Wanderers': 'WOL',
    'Sheffield United': 'SHU',
    'Norwich City': 'NOR',
    'Real Madrid': 'RMA',
    'FC Barcelona': 'BAR',
    'Atlético Madrid': 'ATM',
    'Bayern Munich': 'BAY',
    'Borussia Dortmund': 'BVB',
    'Paris Saint-Germain': 'PSG',
    'Juventus': 'JUV',
    'AC Milan': 'MIL',
    'Inter Milan': 'INT'
  };
  
  // Check elite clubs first
  if (eliteClubMappings[teamName]) {
    return eliteClubMappings[teamName];
  }
  
  // Remove common prefixes and suffixes more aggressively
  let cleanName = teamName
    .replace(/^(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|1\.|Sporting|Club|Real|Athletic|Atlético|Borussia)\s+/i, '')
    .replace(/\s+(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|United|City|Town|Rovers|Wanderers|Athletic|Albion|Palace|Villa|County|Borough|Rangers|Celtic|Hotspur|Wednesday|Saturday|Sunday|Monday|Tuesday|Thursday|Friday)$/i, '');
  
  // Split into words and create compact abbreviation
  const words = cleanName.trim().split(/\s+/);
  
  if (words.length === 1) {
    const word = words[0];
    // For single words, be smarter about length
    if (word.length <= 3) return word.toUpperCase();
    if (word.length <= 5) return word.substring(0, 3).toUpperCase();
    return word.substring(0, 3).toUpperCase();
  } else if (words.length === 2) {
    const first = words[0];
    const second = words[1];
    
    // Enhanced two-word logic
    if (first.length >= 3 && second.length >= 3) {
      return (first.substring(0, 2) + second.substring(0, 1)).toUpperCase();
    } else if (first.length <= 2) {
      return (first + second.substring(0, 2)).toUpperCase();
    } else {
      return (first.substring(0, 2) + second.substring(0, 1)).toUpperCase();
    }
  } else {
    // Three or more words: first char of each word, max 3 chars
    return words.slice(0, 3).map(word => word.charAt(0)).join('').toUpperCase();
  }
};

// Enhanced responsive team name system
export const getResponsiveTeamName = (teamName: string): { 
  full: string; 
  mobile: string; 
  compact: string;
  ultraCompact: string;
} => {
  return {
    full: teamName,
    mobile: shortenTeamName(teamName, 12),
    compact: generateCompactTeamName(teamName),
    ultraCompact: generateCompactTeamName(teamName).substring(0, 3)
  };
};

// Utility for getting team name by screen size
export const getTeamNameForScreen = (
  teamName: string, 
  screenType: 'desktop' | 'tablet' | 'mobile' | 'compact'
): string => {
  const names = getResponsiveTeamName(teamName);
  
  switch (screenType) {
    case 'desktop':
      return names.full;
    case 'tablet':
      return names.mobile;
    case 'mobile':
      return names.compact;
    case 'compact':
      return names.ultraCompact;
    default:
      return names.full;
  }
};
