
import { useIsMobile } from "@/hooks/use-mobile";

interface PremierLeagueHeaderProps {
  fixture: any;
  homeGoals: any[];
  awayGoals: any[];
}

const PremierLeagueHeader = ({ fixture, homeGoals, awayGoals }: PremierLeagueHeaderProps) => {
  const isMobile = useIsMobile();
  
  const homeTeamName = fixture?.home_team?.name || 'Home';
  const awayTeamName = fixture?.away_team?.name || 'Away';
  const homeScore = homeGoals.length;
  const awayScore = awayGoals.length;
  
  const getMatchDate = () => {
    if (!fixture?.match_date) return '';
    return new Date(fixture.match_date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Mobile: Compact vertical layout optimized for export */}
      {isMobile ? (
        <div className="w-full">
          {/* Match Date */}
          <div className="text-center mb-3">
            <div className="text-xs text-slate-300 font-medium">{getMatchDate()}</div>
          </div>
          
          {/* Teams and Score - Compact horizontal layout */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="text-xs text-slate-300 mb-1">HOME</div>
              <div className="font-bold text-sm leading-tight break-words max-w-[80px] mx-auto">
                {homeTeamName}
              </div>
            </div>
            
            {/* Score */}
            <div className="px-4">
              <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {homeScore} - {awayScore}
                  </div>
                  <div className="text-xs text-slate-300">FINAL</div>
                </div>
              </div>
            </div>
            
            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="text-xs text-slate-300 mb-1">AWAY</div>
              <div className="font-bold text-sm leading-tight break-words max-w-[80px] mx-auto">
                {awayTeamName}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop layout */
        <div className="space-y-4">
          {/* Match Info */}
          <div className="text-center">
            <div className="text-sm text-slate-300">{getMatchDate()}</div>
          </div>
          
          {/* Teams and Score */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="text-sm text-slate-300 mb-2">HOME</div>
              <div className="text-2xl font-bold">{homeTeamName}</div>
            </div>
            
            {/* Score */}
            <div className="px-8">
              <div className="bg-white/10 rounded-xl px-6 py-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">
                    {homeScore} - {awayScore}
                  </div>
                  <div className="text-sm text-slate-300">FINAL</div>
                </div>
              </div>
            </div>
            
            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="text-sm text-slate-300 mb-2">AWAY</div>
              <div className="text-2xl font-bold">{awayTeamName}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremierLeagueHeader;
