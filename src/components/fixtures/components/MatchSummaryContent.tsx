
import AccordionMatchSummaryLayout from "./AccordionMatchSummaryLayout";

interface MatchSummaryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  viewStyle?: 'compact' | 'full'; // Keep for backward compatibility but don't use
  isExportMode?: boolean; // Keep for backward compatibility but ignore
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
    <div 
      id="match-summary-content" 
      className="space-y-6 w-full"
    >
      {/* Unified responsive container */}
      <div className="w-full mx-auto max-w-4xl">
        <AccordionMatchSummaryLayout
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
      </div>
    </div>
  );
};

export default MatchSummaryContent;
