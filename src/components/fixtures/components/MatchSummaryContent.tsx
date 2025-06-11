
import AccordionMatchSummaryLayout from "./AccordionMatchSummaryLayout";
import UnifiedMatchSummaryLayout from "./UnifiedMatchSummaryLayout";

interface MatchSummaryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  isExportMode: boolean;
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
  isExportMode,
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
  // Use the new accordion layout by default for better UX
  return (
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
  );
};

export default MatchSummaryContent;
