
import { Fixture } from "@/types/database";

export interface GameweekMapping {
  gameweek: number;
  matchDate: string;
  displayLabel: string;
  fixtureCount: number;
  isFinal?: boolean;
}

/**
 * Added: GameweekCalculationOutput now includes totalMatchdays for accurate final MD detection.
 */
export interface GameweekCalculationResult {
  gameweekMappings: Map<string, GameweekMapping>;
  totalGameweeks: number;
  earliestMatchDate: string | null;
  latestMatchDate: string | null;
  totalMatchdays: number; // New: Maximum assigned matchday (for true "Final MD")
}

/**
 * Enhanced gameweek calculation service
 * Creates intelligent gameweek assignments based on actual fixture data
 */
export class GameweekCalculationService {
  /**
   * Calculate gameweeks from fixture data
   */
  static calculateGameweeks(fixtures: Fixture[]): GameweekCalculationResult {
    if (!fixtures || fixtures.length === 0) {
      return {
        gameweekMappings: new Map(),
        totalGameweeks: 0,
        earliestMatchDate: null,
        latestMatchDate: null,
        totalMatchdays: 0,
      };
    }

    // Extract and sort unique match dates
    const uniqueDates = Array.from(
      new Set(fixtures.map(f => f.match_date).filter(Boolean))
    ).sort();

    if (uniqueDates.length === 0) {
      return {
        gameweekMappings: new Map(),
        totalGameweeks: 0,
        earliestMatchDate: null,
        latestMatchDate: null,
        totalMatchdays: 0,
      };
    }

    // Group fixtures by date to count matches per gameweek
    const fixturesByDate = new Map<string, Fixture[]>();
    fixtures.forEach(fixture => {
      if (fixture.match_date) {
        if (!fixturesByDate.has(fixture.match_date)) {
          fixturesByDate.set(fixture.match_date, []);
        }
        fixturesByDate.get(fixture.match_date)!.push(fixture);
      }
    });

    // Create gameweek mappings
    const gameweekMappings = new Map<string, GameweekMapping>();
    const totalGameweeks = uniqueDates.length;
    const totalMatchdays = totalGameweeks; // By design: 1 matchday per date (sorted); could be decoupled if multi-rounds

    uniqueDates.forEach((date, index) => {
      const gameweekNumber = index + 1;
      const fixturesOnDate = fixturesByDate.get(date) || [];
      // Only assign "Final MD" to last *actual* scheduled date
      const isFinal = (gameweekNumber === totalMatchdays && totalMatchdays > 1);
      
      let displayLabel: string;
      if (isFinal) {
        displayLabel = "Final MD";
      } else {
        displayLabel = `MD${gameweekNumber}`;
      }

      gameweekMappings.set(date, {
        gameweek: gameweekNumber,
        matchDate: date,
        displayLabel,
        fixtureCount: fixturesOnDate.length,
        isFinal
      });
    });

    return {
      gameweekMappings,
      totalGameweeks,
      earliestMatchDate: uniqueDates[0],
      latestMatchDate: uniqueDates[uniqueDates.length - 1],
      totalMatchdays
    };
  }

  static getGameweekForDate(date: string, gameweekMappings: Map<string, GameweekMapping>): GameweekMapping | null {
    return gameweekMappings.get(date) || null;
  }

  static getGameweekDisplayLabel(date: string, gameweekMappings: Map<string, GameweekMapping>): string {
    const mapping = gameweekMappings.get(date);
    return mapping?.displayLabel || '';
  }
}
