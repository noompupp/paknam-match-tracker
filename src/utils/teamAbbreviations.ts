
/**
 * Enhanced team abbreviations for mobile display with better football-specific patterns
 */
export const generateTeamAbbreviation = (teamName: string): string => {
  if (!teamName || teamName === 'TBD') return 'TBD';
  
  // Handle special cases and common team name patterns first
  const specialCases: Record<string, string> = {
    'Manchester United': 'MAN UTD',
    'Manchester City': 'MAN CITY',
    'Real Madrid': 'R. MADRID',
    'FC Barcelona': 'BARCELONA',
    'Barcelona': 'BARCELONA',
    'Bayern Munich': 'BAYERN',
    'Paris Saint-Germain': 'PSG',
    'Borussia Dortmund': 'DORTMUND',
    'Atlético Madrid': 'ATLETICO',
    'Tottenham Hotspur': 'TOTTENHAM',
    'Leicester City': 'LEICESTER',
    'West Ham United': 'WEST HAM',
    'Newcastle United': 'NEWCASTLE',
    'Brighton & Hove Albion': 'BRIGHTON',
    'Crystal Palace': 'C. PALACE',
    'Wolverhampton Wanderers': 'WOLVES',
    'Sheffield United': 'SHEFFIELD',
    'Norwich City': 'NORWICH',
    'Aston Villa': 'A. VILLA',
    'Arsenal': 'ARSENAL',
    'Chelsea': 'CHELSEA',
    'Liverpool': 'LIVERPOOL',
    'Leeds United': 'LEEDS',
    'Everton': 'EVERTON'
  };
  
  // Check for exact matches first
  if (specialCases[teamName]) {
    return specialCases[teamName];
  }
  
  // Clean the name by removing common prefixes and suffixes
  let cleanName = teamName
    .replace(/^(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|1\.|Sporting|Club|Real|Athletic|Atlético|Borussia)\s+/i, '')
    .replace(/\s+(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|United|City|Town|Rovers|Wanderers|Athletic|Albion|Palace|Villa|County|Borough|Rangers|Celtic|Hotspur|Wednesday|Saturday|Sunday|Monday|Tuesday|Thursday|Friday|Football|Club)$/i, '');
  
  // Apply common abbreviations
  const abbreviations = [
    { regex: /\bUnited\b/gi, replacement: 'UTD' },
    { regex: /\bAthletic\b/gi, replacement: 'ATH' },
    { regex: /\bRangers\b/gi, replacement: 'RANGERS' },
    { regex: /\bCity\b/gi, replacement: 'CITY' },
    { regex: /\bTown\b/gi, replacement: 'TOWN' },
    { regex: /\bRovers\b/gi, replacement: 'ROVERS' },
    { regex: /\bWanderers\b/gi, replacement: 'WAND' },
    { regex: /\bInternational\b/gi, replacement: 'INT' },
    { regex: /\bAcademy\b/gi, replacement: 'ACAD' },
    { regex: /\bCollege\b/gi, replacement: 'COL' },
    { regex: /\bUniversity\b/gi, replacement: 'UNI' },
    { regex: /\bHotspur\b/gi, replacement: 'HOTSPUR' },
    { regex: /\bAlbion\b/gi, replacement: 'ALBION' },
    { regex: /\bPalace\b/gi, replacement: 'PALACE' },
    { regex: /\bVilla\b/gi, replacement: 'VILLA' }
  ];
  
  abbreviations.forEach(abbrev => {
    cleanName = cleanName.replace(abbrev.regex, abbrev.replacement);
  });
  
  // Trim and handle the result
  cleanName = cleanName.trim();
  
  // If the cleaned name is short enough, return it
  if (cleanName.length <= 10) {
    return cleanName.toUpperCase();
  }
  
  // Split into words for further processing
  const words = cleanName.split(/\s+/);
  
  if (words.length === 1) {
    // Single word: return first 8 characters
    return words[0].substring(0, 8).toUpperCase();
  } else if (words.length === 2) {
    // Two words: try to fit both, abbreviate if needed
    const word1 = words[0];
    const word2 = words[1];
    
    if ((word1.length + word2.length + 1) <= 10) {
      return `${word1} ${word2}`.toUpperCase();
    } else {
      // Abbreviate: first 4-5 chars of first word + first 3-4 chars of second
      const firstPart = word1.substring(0, Math.min(5, word1.length));
      const secondPart = word2.substring(0, Math.min(4, word2.length));
      return `${firstPart} ${secondPart}`.toUpperCase();
    }
  } else {
    // Three or more words: take key words or abbreviate
    const importantWords = words.filter(word => 
      !['the', 'and', 'of', 'in', 'at', 'on', 'for', 'with', 'by'].includes(word.toLowerCase())
    );
    
    if (importantWords.length <= 2) {
      return importantWords.join(' ').substring(0, 10).toUpperCase();
    } else {
      // Take first 2-3 important words
      return importantWords.slice(0, 2).join(' ').substring(0, 10).toUpperCase();
    }
  }
};

// Generate 3-letter abbreviation specifically for mobile portrait mode
export const generateThreeLetterAbbreviation = (teamName: string): string => {
  if (!teamName || teamName === 'TBD') return 'TBD';
  
  // Special 3-letter cases
  const threeLetterCases: Record<string, string> = {
    'Manchester United': 'MUN',
    'Manchester City': 'MCI',
    'Real Madrid': 'RMA',
    'FC Barcelona': 'BAR',
    'Barcelona': 'BAR',
    'Bayern Munich': 'BAY',
    'Paris Saint-Germain': 'PSG',
    'Borussia Dortmund': 'BVB',
    'Atlético Madrid': 'ATM',
    'Tottenham Hotspur': 'TOT',
    'Leicester City': 'LEI',
    'West Ham United': 'WHU',
    'Newcastle United': 'NEW',
    'Brighton & Hove Albion': 'BRI',
    'Crystal Palace': 'CRY',
    'Wolverhampton Wanderers': 'WOL',
    'Sheffield United': 'SHU',
    'Norwich City': 'NOR',
    'Aston Villa': 'AVL',
    'Arsenal': 'ARS',
    'Chelsea': 'CHE',
    'Liverpool': 'LIV',
    'Leeds United': 'LEE',
    'Everton': 'EVE'
  };
  
  // Check for exact matches first
  if (threeLetterCases[teamName]) {
    return threeLetterCases[teamName];
  }
  
  // Clean the name and take first 3 letters
  let cleanName = teamName
    .replace(/^(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|1\.|Sporting|Club|Real|Athletic|Atlético|Borussia)\s+/i, '')
    .replace(/\s+(FC|CF|AC|AS|SK|FK|SC|RC|SL|BK|IF|IK|GK|HK|NK|PK|RK|TK|VK|AK|BV|SV|TSV|VfB|VfL|United|City|Town|Rovers|Wanderers|Athletic|Albion|Palace|Villa|County|Borough|Rangers|Celtic|Hotspur|Wednesday|Saturday|Sunday|Monday|Tuesday|Thursday|Friday|Football|Club)$/i, '');
  
  cleanName = cleanName.trim();
  
  // If multiple words, try to take first letter of each word
  const words = cleanName.split(/\s+/);
  if (words.length >= 3) {
    return (words[0].charAt(0) + words[1].charAt(0) + words[2].charAt(0)).toUpperCase();
  } else if (words.length === 2) {
    // Take first 2 letters of first word + first letter of second word
    return (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase();
  } else {
    // Single word - take first 3 letters
    return words[0].substring(0, 3).toUpperCase();
  }
};

// Get team abbreviation with fallback
export const getTeamAbbreviation = (teamName: string): string => {
  try {
    return generateTeamAbbreviation(teamName);
  } catch (error) {
    console.warn('Error generating team abbreviation:', error);
    return teamName?.substring(0, 8).toUpperCase() || 'TBD';
  }
};

// Get 3-letter abbreviation for mobile portrait
export const getThreeLetterAbbreviation = (teamName: string): string => {
  try {
    return generateThreeLetterAbbreviation(teamName);
  } catch (error) {
    console.warn('Error generating 3-letter abbreviation:', error);
    return teamName?.substring(0, 3).toUpperCase() || 'TBD';
  }
};
