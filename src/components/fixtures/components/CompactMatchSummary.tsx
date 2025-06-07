
import TeamLogoDisplay from "../TeamLogoDisplay";
import CompactScoreDisplay from "./CompactScoreDisplay";

interface CompactMatchSummaryProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const CompactMatchSummary = ({
  fixture,
  homeTeamColor,
  awayTeamColor
}: CompactMatchSummaryProps) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      {/* Header with match info */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <span className="font-medium">
          {fixture.match_date}
        </span>
        {fixture.venue && (
          <span>📍 {fixture.venue}</span>
        )}
      </div>

      {/* Main horizontal layout */}
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <TeamLogoDisplay 
            teamName={fixture.home_team?.name || 'Home Team'}
            teamLogo={fixture.home_team?.logoURL}
            teamColor={homeTeamColor}
            size="sm"
            showName={false}
            isPremierLeagueStyle={true}
          />
          <div className="min-w-0 flex-1">
            <div 
              className="font-semibold text-sm leading-tight break-words"
              style={{ color: homeTeamColor }}
            >
              {fixture.home_team?.name || 'Home Team'}
            </div>
          </div>
        </div>

        {/* Score */}
        <CompactScoreDisplay
          homeScore={fixture.home_score || 0}
          awayScore={fixture.away_score || 0}
          homeTeamColor={homeTeamColor}
          awayTeamColor={awayTeamColor}
          status={fixture.status}
        />

        {/* Away Team */}
        <div className="flex items-center gap-3 min-w-0 flex-1 flex-row-reverse">
          <TeamLogoDisplay 
            teamName={fixture.away_team?.name || 'Away Team'}
            teamLogo={fixture.away_team?.logoURL}
            teamColor={awayTeamColor}
            size="sm"
            showName={false}
            isPremierLeagueStyle={true}
          />
          <div className="min-w-0 flex-1 text-right">
            <div 
              className="font-semibold text-sm leading-tight break-words"
              style={{ color: awayTeamColor }}
            >
              {fixture.away_team?.name || 'Away Team'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactMatchSummary;
