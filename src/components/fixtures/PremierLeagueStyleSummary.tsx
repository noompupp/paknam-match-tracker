
import { getGoalAssistPlayerName } from "./utils/matchSummaryDataProcessor";
import { extractTeamData, processTeamEvents } from "./utils/teamDataProcessor";
import PremierLeagueMatchContent from "./components/PremierLeagueMatchContent";
import CollapsibleMatchDetails from "./components/CollapsibleMatchDetails";
import MatchStatisticsFooter from "./MatchStatisticsFooter";
import IPhoneStoryLayout from "./components/export/IPhoneStoryLayout";
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
  
  console.log('🎨 PremierLeagueStyleSummary: Enhanced processing with assist support:', {
    fixtureId: fixture?.id,
    homeTeamId: fixture?.home_team_id,
    awayTeamId: fixture?.away_team_id,
    homeTeamName: fixture?.home_team?.name,
    awayTeamName: fixture?.away_team?.name,
    totalGoals: goals.length,
    totalCards: cards.length,
    detailedGoalsWithAssists: goals.map(g => ({
      id: g.id,
      teamId: getGoalTeamId(g),
      player: getGoalPlayerName(g),
      assist: getGoalAssistPlayerName(g),
      time: getGoalTime(g),
      rawTeamData: {
        teamId: g.teamId,
        team_id: g.team_id,
        team: g.team,
        teamName: g.teamName
      }
    }))
  });

  // Extract team data using the new utility
  const teamData = extractTeamData(fixture);

  // Process team events using the new utility
  const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

  // Check if we're in export mode on mobile
  const isExportMode = isMobile && document.getElementById('match-summary-content')?.classList.contains('export-mode-mobile');

  // Use iPhone story layout for mobile export mode
  if (isMobile && isExportMode) {
    return (
      <IPhoneStoryLayout
        fixture={fixture}
        goals={goals}
        cards={cards}
        homeGoals={processedEvents.homeGoals}
        awayGoals={processedEvents.awayGoals}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
        timelineEvents={timelineEvents}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Main content sections */}
      <PremierLeagueMatchContent
        fixture={fixture}
        goals={goals}
        cards={cards}
        teamData={teamData}
        processedEvents={processedEvents}
        getGoalPlayerName={getGoalPlayerName}
        getGoalTime={getGoalTime}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />

      {/* Enhanced Match Details */}
      <CollapsibleMatchDetails
        fixture={fixture}
        timelineEvents={timelineEvents}
        formatTime={formatTime}
      />

      {/* Enhanced Match Statistics Footer */}
      <MatchStatisticsFooter 
        homeGoals={processedEvents.homeGoals}
        awayGoals={processedEvents.awayGoals}
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
