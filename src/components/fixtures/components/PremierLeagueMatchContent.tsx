
import PremierLeagueHeader from "../PremierLeagueHeader";
import GoalsSection from "../GoalsSection";
import CardsSection from "../CardsSection";
import { TeamData, ProcessedTeamEvents } from "../utils/teamDataProcessor";

interface PremierLeagueMatchContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  teamData: TeamData;
  processedEvents: ProcessedTeamEvents;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const PremierLeagueMatchContent = ({
  fixture,
  goals,
  cards,
  teamData,
  processedEvents,
  getGoalPlayerName,
  getGoalTime,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: PremierLeagueMatchContentProps) => {
  const { homeTeamColor, awayTeamColor } = teamData;
  const { homeGoals, awayGoals, homeCards, awayCards } = processedEvents;

  return (
    <>
      {/* Premier League Style Header with Enhanced Team Logos */}
      <PremierLeagueHeader 
        fixture={fixture}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
      />

      {/* Enhanced Goals Section with Assist Support */}
      <GoalsSection 
        goals={goals}
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
        getGoalPlayerName={getGoalPlayerName}
        getGoalTime={getGoalTime}
      />

      {/* Enhanced Collapsible Cards Section */}
      <CardsSection 
        cards={cards}
        homeCards={homeCards}
        awayCards={awayCards}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />
    </>
  );
};

export default PremierLeagueMatchContent;
