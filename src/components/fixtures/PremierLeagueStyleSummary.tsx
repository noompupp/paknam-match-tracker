
import AccordionMatchSummaryLayout from "./components/AccordionMatchSummaryLayout";

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
  // Use the new accordion layout for enhanced match summary display
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

export default PremierLeagueStyleSummary;
