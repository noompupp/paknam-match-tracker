
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database } from "lucide-react";
import PremierLeagueStyleSummary from "../PremierLeagueStyleSummary";
import TraditionalMatchSummaryView from "./TraditionalMatchSummaryView";

interface MatchSummaryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  viewStyle: 'compact' | 'full';
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
  return (
    <div id="match-summary-content" className="space-y-6">
      {/* Enhanced Data Status */}
      {enhancedSuccess && enhancedData?.timelineEvents?.length > 0 && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Enhanced timeline active - displaying {timelineEvents.length} unified match events with {goals.length} goals and {cards.length} cards.
          </AlertDescription>
        </Alert>
      )}

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
  );
};

export default MatchSummaryContent;
