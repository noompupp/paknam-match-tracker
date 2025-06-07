
import { normalizeTeamId, filterGoalsByTeam } from './matchSummaryDataProcessor';

export interface TeamData {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamColor: string;
  awayTeamColor: string;
}

export interface ProcessedTeamEvents {
  homeGoals: any[];
  awayGoals: any[];
  homeCards: any[];
  awayCards: any[];
}

export const extractTeamData = (fixture: any): TeamData => {
  const homeTeamId = normalizeTeamId(fixture?.home_team_id);
  const awayTeamId = normalizeTeamId(fixture?.away_team_id);
  const homeTeamName = fixture?.home_team?.name;
  const awayTeamName = fixture?.away_team?.name;
  const homeTeamColor = fixture.home_team?.color || "#1f2937";
  const awayTeamColor = fixture.away_team?.color || "#7c3aed";

  console.log('🎨 Team data extraction:', {
    homeTeamId,
    awayTeamId,
    homeTeamName,
    awayTeamName,
    fixtureHomeTeam: fixture?.home_team,
    fixtureAwayTeam: fixture?.away_team
  });

  return {
    homeTeamId,
    awayTeamId,
    homeTeamName,
    awayTeamName,
    homeTeamColor,
    awayTeamColor
  };
};

export const processTeamEvents = (
  goals: any[], 
  cards: any[], 
  teamData: TeamData,
  getCardTeamId: (card: any) => string
): ProcessedTeamEvents => {
  const { homeTeamId, awayTeamId, homeTeamName, awayTeamName } = teamData;

  console.log('🎨 About to filter goals with enhanced logic');
  const homeGoals = filterGoalsByTeam(goals, homeTeamId, homeTeamName);
  const awayGoals = filterGoalsByTeam(goals, awayTeamId, awayTeamName);

  const homeCards = cards.filter(c => {
    const cardTeamId = getCardTeamId(c);
    const normalizedCardTeamId = normalizeTeamId(cardTeamId);
    const matches = normalizedCardTeamId === homeTeamId;
    
    console.log('🟨 Home card filtering:', {
      cardId: c.id,
      cardTeamId,
      normalizedCardTeamId,
      homeTeamId,
      matches
    });
    
    return matches;
  });
  
  const awayCards = cards.filter(c => {
    const cardTeamId = getCardTeamId(c);
    const normalizedCardTeamId = normalizeTeamId(cardTeamId);
    const matches = normalizedCardTeamId === awayTeamId;
    
    console.log('🟨 Away card filtering:', {
      cardId: c.id,
      cardTeamId,
      normalizedCardTeamId,
      awayTeamId,
      matches
    });
    
    return matches;
  });

  console.log('🎨 Enhanced final team data analysis with assists:', {
    homeGoals: homeGoals.length,
    awayGoals: awayGoals.length,
    homeCards: homeCards.length,
    awayCards: awayCards.length,
    totalGoalsBeforeFiltering: goals.length,
    totalGoalsAfterFiltering: homeGoals.length + awayGoals.length
  });

  return {
    homeGoals,
    awayGoals,
    homeCards,
    awayCards
  };
};
