
import { formatDateDisplay } from "@/utils/timeUtils";
import { GameweekCalculationService, GameweekMapping } from "@/services/gameweekCalculationService";

export interface GroupedFixtures {
  date: string;
  displayDate: string;
  fixtures: any[];
  gameweek?: number;
  gameweekLabel?: string;
  isFinalGameweek?: boolean;
}

// Global gameweek mappings cache
let gameweekMappingsCache: Map<string, GameweekMapping> | null = null;

/**
 * Initialize gameweek mappings from fixtures
 */
export const initializeGameweekMappings = (allFixtures: any[]) => {
  const result = GameweekCalculationService.calculateGameweeks(allFixtures);
  gameweekMappingsCache = result.gameweekMappings;
  console.log('🎯 Gameweek mappings initialized:', {
    totalGameweeks: result.totalGameweeks,
    earliestDate: result.earliestMatchDate,
    latestDate: result.latestMatchDate,
    mappings: Array.from(result.gameweekMappings.entries())
  });
};

/**
 * Get gameweek information for a date
 */
export const getGameweekInfo = (dateString: string) => {
  if (!gameweekMappingsCache) {
    return { gameweek: undefined, gameweekLabel: undefined, isFinalGameweek: false };
  }

  const mapping = GameweekCalculationService.getGameweekForDate(dateString, gameweekMappingsCache);
  if (!mapping) {
    return { gameweek: undefined, gameweekLabel: undefined, isFinalGameweek: false };
  }

  return {
    gameweek: mapping.gameweek,
    gameweekLabel: mapping.displayLabel,
    isFinalGameweek: mapping.isFinal || false
  };
};

/**
 * Groups fixtures by date for better organization
 */
export const groupFixturesByDate = (fixtures: any[]): GroupedFixtures[] => {
  if (!fixtures || fixtures.length === 0) {
    return [];
  }

  // Initialize gameweek mappings if not already done
  if (!gameweekMappingsCache) {
    initializeGameweekMappings(fixtures);
  }

  // Create a map to group fixtures by date
  const groupedMap = new Map<string, any[]>();
  
  fixtures.forEach(fixture => {
    const date = fixture.match_date;
    if (!date) return;
    
    if (!groupedMap.has(date)) {
      groupedMap.set(date, []);
    }
    groupedMap.get(date)!.push(fixture);
  });

  // Convert map to sorted array
  const groupedArray: GroupedFixtures[] = [];
  
  // Sort dates
  const sortedDates = Array.from(groupedMap.keys()).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  sortedDates.forEach(date => {
    const fixtures = groupedMap.get(date)!;
    const gameweekInfo = getGameweekInfo(date);
    
    groupedArray.push({
      date,
      displayDate: formatDateDisplay(date),
      fixtures: fixtures.sort((a, b) => {
        // Sort by time within each date
        const timeA = a.match_time || '18:00:00';
        const timeB = b.match_time || '18:00:00';
        return timeA.localeCompare(timeB);
      }),
      gameweek: gameweekInfo.gameweek,
      gameweekLabel: gameweekInfo.gameweekLabel,
      isFinalGameweek: gameweekInfo.isFinalGameweek
    });
  });

  return groupedArray;
};

/**
 * Determines if a date is today
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

/**
 * Determines if a date is tomorrow
 */
export const isTomorrow = (dateString: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];
  return dateString === tomorrowString;
};

/**
 * Gets a friendly date label
 */
export const getFriendlyDateLabel = (dateString: string, displayDate: string): string => {
  if (isToday(dateString)) {
    return `Today • ${displayDate}`;
  }
  if (isTomorrow(dateString)) {
    return `Tomorrow • ${displayDate}`;
  }
  return displayDate;
};
