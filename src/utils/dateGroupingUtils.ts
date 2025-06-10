
import { formatDateDisplay } from "@/utils/timeUtils";

export interface GroupedFixtures {
  date: string;
  displayDate: string;
  fixtures: any[];
  gameweek?: number;
}

/**
 * Calculate gameweek number based on date
 * For now, using a simple calculation based on weeks since a start date
 * This can be adjusted based on actual league schedule
 */
export const calculateGameweek = (dateString: string): number => {
  // Using a hypothetical season start date - adjust this based on your league
  const seasonStart = new Date('2024-09-01'); // September 1st, 2024
  const matchDate = new Date(dateString);
  
  // Calculate weeks difference
  const timeDiff = matchDate.getTime() - seasonStart.getTime();
  const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 7));
  
  // Ensure gameweek is at least 1
  return Math.max(1, weeksDiff + 1);
};

/**
 * Groups fixtures by date for better organization
 */
export const groupFixturesByDate = (fixtures: any[]): GroupedFixtures[] => {
  if (!fixtures || fixtures.length === 0) {
    return [];
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
    groupedArray.push({
      date,
      displayDate: formatDateDisplay(date),
      fixtures: fixtures.sort((a, b) => {
        // Sort by time within each date
        const timeA = a.match_time || '18:00:00';
        const timeB = b.match_time || '18:00:00';
        return timeA.localeCompare(timeB);
      }),
      gameweek: calculateGameweek(date)
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
