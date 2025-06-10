
export const shortenTeamName = (teamName: string, maxLength: number = 12): string => {
  if (!teamName || teamName.length <= maxLength) return teamName;
  
  // Enhanced football team name patterns with better mobile abbreviations
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
    { regex: /\b(International)\b/gi, replacement: 'Int' },
    { regex: /\b(Academy)\b/gi, replacement: 'Aca' },
    { regex: /\b(College)\b/gi, replacement: 'Col' },
    { regex: /\b(University)\b/gi, replacement: 'Uni' },
    { regex: /\b(Hotspur)\b/gi, replacement: 'Hot' },
    { regex: /\b(Albion)\b/gi, replacement: 'Alb' },
    { regex: /\b(Palace)\b/gi, replacement: 'Pal' },
    { regex: /\b(Villa)\b/gi, replacement: 'Vil' }
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

export const getResponsiveTeamName = (teamName: string): { full: string; mobile: string; compact: string } => {
  return {
    full: teamName,
    mobile: shortenTeamName(teamName, 14), // Slightly longer for better readability
    compact: shortenTeamName(teamName, 8)
  };
};

// Enhanced team name formatting for specific mobile contexts
export const getMobileOptimizedName = (teamName: string): string => {
  if (!teamName) return 'TBD';
  
  // Special cases for very common team names
  const specialCases: Record<string, string> = {
    'Manchester United': 'Man Utd',
    'Manchester City': 'Man City',
    'Real Madrid': 'Real Madrid',
    'FC Barcelona': 'Barcelona',
    'Bayern Munich': 'Bayern',
    'Paris Saint-Germain': 'PSG',
    'Borussia Dortmund': 'Dortmund',
    'Atlético Madrid': 'Atletico',
    'Tottenham Hotspur': 'Tottenham',
    'Leicester City': 'Leicester',
    'West Ham United': 'West Ham',
    'Newcastle United': 'Newcastle',
    'Brighton & Hove Albion': 'Brighton',
    'Crystal Palace': 'Crystal P.',
    'Wolverhampton Wanderers': 'Wolves',
    'Sheffield United': 'Sheffield U',
    'Norwich City': 'Norwich',
    'Aston Villa': 'A. Villa'
  };
  
  // Check for special cases first
  if (specialCases[teamName]) {
    return specialCases[teamName];
  }
  
  // Use the general shortening function
  return shortenTeamName(teamName, 14);
};
