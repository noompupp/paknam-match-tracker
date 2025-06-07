
import PremierLeagueStyleSummary from "../PremierLeagueStyleSummary";
import TraditionalMatchSummaryView from "./TraditionalMatchSummaryView";
import CompactMatchSummary from "./CompactMatchSummary";

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
  // Extract team colors (simple fallback colors based on team names)
  const getTeamColor = (teamName: string) => {
    const colors = ['#E53E3E', '#3182CE', '#38A169', '#D69E2E', '#805AD5', '#DD6B20'];
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
      hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const homeTeamColor = getTeamColor(fixture.home_team?.name || 'Home');
  const awayTeamColor = getTeamColor(fixture.away_team?.name || 'Away');

  return (
    <div id="match-summary-content" className="space-y-4 md:space-y-6">
      {/* Render based on view style */}
      {viewStyle === 'compact' ? (
        <div className="space-y-4">
          <CompactMatchSummary
            fixture={fixture}
            homeTeamColor={homeTeamColor}
            awayTeamColor={awayTeamColor}
          />
          
          {/* Show simplified stats below compact summary */}
          {(goals.length > 0 || cards.length > 0) && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: homeTeamColor }}>
                  {goals.filter(g => getGoalTeamId(g) === fixture.home_team_id?.toString()).length}
                </div>
                <div className="text-xs text-gray-600">Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{cards.length}</div>
                <div className="text-xs text-gray-600">Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: awayTeamColor }}>
                  {goals.filter(g => getGoalTeamId(g) === fixture.away_team_id?.toString()).length}
                </div>
                <div className="text-xs text-gray-600">Goals</div>
              </div>
            </div>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default MatchSummaryContent;
