
import EnhancedMatchStatisticsFooter from "./components/EnhancedMatchStatisticsFooter";

interface MatchStatisticsFooterProps {
  homeGoals: any[];
  awayGoals: any[];
  cards: any[];
  timelineEvents: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  fixture: any;
}

const MatchStatisticsFooter = ({
  homeGoals,
  awayGoals,
  cards,
  timelineEvents,
  homeTeamColor,
  awayTeamColor,
  fixture
}: MatchStatisticsFooterProps) => {
  // Use the enhanced version for better Premier League styling
  return (
    <EnhancedMatchStatisticsFooter
      homeGoals={homeGoals}
      awayGoals={awayGoals}
      cards={cards}
      timelineEvents={timelineEvents}
      homeTeamColor={homeTeamColor}
      awayTeamColor={awayTeamColor}
      fixture={fixture}
    />
  );
};

export default MatchStatisticsFooter;
