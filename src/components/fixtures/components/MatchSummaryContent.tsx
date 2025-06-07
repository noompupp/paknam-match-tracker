
import PremierLeagueStyleSummary from "../PremierLeagueStyleSummary";
import TraditionalMatchSummaryView from "./TraditionalMatchSummaryView";
import MobileExportLayout from "./MobileExportLayout";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";
import { useIsMobile } from "@/hooks/use-mobile";

interface MatchSummaryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  viewStyle: 'compact' | 'full';
  isExportMode?: boolean;
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

const MatchSummaryContent = ({
  fixture,
  goals,
  cards,
  timelineEvents,
  enhancedSuccess,
  enhancedData,
  viewStyle,
  isExportMode = false,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: MatchSummaryContentProps) => {
  const isMobile = useIsMobile();

  // Extract team data for mobile export layout
  const teamData = extractTeamData(fixture);
  const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

  // Use mobile export layout when in export mode on mobile
  if (isExportMode && isMobile) {
    return (
      <MobileExportLayout
        fixture={fixture}
        goals={goals}
        cards={cards}
        homeGoals={processedEvents.homeGoals}
        awayGoals={processedEvents.awayGoals}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
      />
    );
  }

  return (
    <div id="match-summary-content" className="space-y-6 w-full">
      {/* Mobile-optimized container with proper centering */}
      <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 768px)' }}>
        {/* Render based on view style */}
        {viewStyle === 'compact' ? (
          <PremierLeagueStyleSummary
            fixture={fixture}
            goals={goals}
            cards={cards}
            timelineEvents={timelineEvents}
            formatTime={formatTime}
            getGoalTeamId={getGoalTeamId}
            getGoalPlayerName={getGoalPlayerName}
            getGoalTime={getGoalTime}
            getCardTeamId={getCardTeamId}
            getCardPlayerName={getCardPlayerName}
            getCardTime={getCardTime}
            getCardType={getCardType}
            isCardRed={isCardRed}
          />
        ) : (
          <TraditionalMatchSummaryView
            fixture={fixture}
            goals={goals}
            cards={cards}
            enhancedSuccess={enhancedSuccess}
            enhancedData={enhancedData}
            formatTime={formatTime}
            getGoalTeamId={getGoalTeamId}
            getGoalPlayerName={getGoalPlayerName}
            getGoalTime={getGoalTime}
            getCardTeamId={getCardTeamId}
            getCardPlayerName={getCardPlayerName}
            getCardTime={getCardTime}
            getCardType={getCardType}
            isCardRed={isCardRed}
          />
        )}
      </div>
    </div>
  );
};

export default MatchSummaryContent;
