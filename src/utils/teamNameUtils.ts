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

export const generateCompactTeamName = (teamName: string): string => {
  if (!teamName) return 'TM';
  
  // Enhanced special cases for compact display
  const compactSpecialCases: Record<string, string> = {
    'Manchester United': 'MUN',
    'Manchester City': 'MCI',
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
  if (compactSpecialCases[teamName]) {
    return compactSpecialCases[teamName];
  }
  
  // Remove common prefixes and suffixes more aggressively
  let cleanName = teamName
    .replace(/^(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|1\.|Sporting|Club|Real|Athletic|Atlético|Borussia)\s+/i, '')
    .replace(/\s+(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|United|City|Town|Rovers|Wanderers|Athletic|Albion|Palace|Villa|County|Borough|Rangers|Celtic|Hotspur|Wednesday|Saturday|Sunday|Monday|Tuesday|Thursday|Friday)$/i, '');
  
  // Split into words and create compact abbreviation
  const words = cleanName.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 3 characters, max 4 for longer names
    const word = words[0];
    if (word.length <= 4) return word.toUpperCase();
    return word.substring(0, 3).toUpperCase();
  } else if (words.length === 2) {
    // Two words: more intelligent abbreviation
    const first = words[0];
    const second = words[1];
    
    // If first word is very short, use more of it
    if (first.length <= 2) {
      return (first + second.substring(0, 2)).toUpperCase();
    }
    // Otherwise, balanced approach
    return (first.substring(0, 2) + second.substring(0, 1)).toUpperCase();
  } else {
    // Three or more words: first char of each word, max 4 chars
    return words.slice(0, 4).map(word => word.charAt(0)).join('').toUpperCase();
  }
};

export const getResponsiveTeamName = (teamName: string): { full: string; mobile: string; compact: string } => {
  return {
    full: teamName,
    mobile: shortenTeamName(teamName, 12),
    compact: generateCompactTeamName(teamName)
  };
};
