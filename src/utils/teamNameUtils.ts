
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

export const getResponsiveTeamName = (teamName: string): { full: string; mobile: string; compact: string } => {
  return {
    full: teamName,
    mobile: shortenTeamName(teamName, 12),
    compact: shortenTeamName(teamName, 8)
  };
};
