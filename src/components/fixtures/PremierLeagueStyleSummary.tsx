
import PremierLeagueHeader from "./PremierLeagueHeader";
import MatchEventsSection from "./MatchEventsSection";
import MatchStatisticsFooter from "./MatchStatisticsFooter";
import { extractTeamData, processTeamEvents } from "./utils/teamDataProcessor";
import { useIsMobile } from "@/hooks/use-mobile";

interface PremierLeagueStyleSummaryProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
  getGoalTeamId: (goal: any) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const PremierLeagueStyleSummary = ({
  fixture,
  goals,
  cards,
  timelineEvents,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: PremierLeagueStyleSummaryProps) => {
  const isMobile = useIsMobile();

  const teamData = extractTeamData(fixture);
  const { homeGoals, awayGoals, homeCards, awayCards } = processTeamEvents(
    goals, 
    cards, 
    teamData, 
    getCardTeamId
  );

  // Enhanced assist extraction
  const getGoalAssistPlayerName = (goal: any): string => {
    const possibleAssistNames = [
      goal.assistPlayerName,
      goal.assist_player_name,
      goal.assistPlayer?.name,
      goal.assist?.player_name,
      goal.assist?.name,
      goal.assist?.playerName,
      goal.assist_name,
      goal.assistName
    ];
    
    return possibleAssistNames.find(name => name && name.trim() !== '') || '';
  };

  return (
    <div className={`space-y-4 w-full ${isMobile ? 'max-w-[375px] mx-auto' : 'max-w-[768px] mx-auto'}`}>
      {/* Enhanced Header with improved mobile layout */}
      <PremierLeagueHeader
        fixture={fixture}
        homeGoals={homeGoals}
        awayGoals={awayGoals}
      />

      {/* Enhanced Match Events Section with left/right alignment */}
      <MatchEventsSection
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        homeTeamId={teamData.homeTeamId}
        awayTeamId={teamData.awayTeamId}
        homeTeamName={teamData.homeTeamName}
        awayTeamName={teamData.awayTeamName}
        formatTime={formatTime}
        getGoalPlayerName={getGoalPlayerName}
        getGoalAssistPlayerName={getGoalAssistPlayerName}
        getGoalTime={getGoalTime}
        getGoalTeamId={getGoalTeamId}
      />

      {/* Enhanced Statistics Footer */}
      <MatchStatisticsFooter
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        cards={cards}
        timelineEvents={timelineEvents}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
        fixture={fixture}
      />
    </div>
  );
};

export default PremierLeagueStyleSummary;
