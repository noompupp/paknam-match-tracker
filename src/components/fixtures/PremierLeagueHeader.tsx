
import { useIsMobile } from "@/hooks/use-mobile";
import TeamLogoDisplay from "./TeamLogoDisplay";

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
    <div className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl ${isMobile ? 'p-5' : 'p-6'} shadow-xl`}>
      {/* Mobile: Enhanced compact layout */}
      {isMobile ? (
        <div className="w-full space-y-5">
          {/* Match Date with better spacing */}
          <div className="text-center pt-1">
            <div className="text-sm text-slate-300 font-medium tracking-wide">{getMatchDate()}</div>
          </div>
          
          {/* Teams and Score - Enhanced layout with logos */}
          <div className="flex items-center justify-between">
            {/* Home Team with Logo */}
            <div className="flex-1 flex flex-col items-center max-w-[100px]">
              <TeamLogoDisplay
                teamName={homeTeamName}
                teamLogo={fixture?.home_team?.logo}
                teamColor={fixture?.home_team?.color || "#1f2937"}
                size="sm"
              />
              <div className="mt-3 text-center">
                <div className="font-bold text-base leading-tight break-words text-center">
                  {homeTeamName}
                </div>
              </div>
            </div>
            
            {/* Enhanced Score Area - positioned to align with logos */}
            <div className="px-6 flex items-center">
              <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-xl px-4 py-3 backdrop-blur-sm shadow-lg border border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-bold tracking-tight">
                    {homeScore} - {awayScore}
                  </div>
                  <div className="text-xs text-slate-200 font-medium mt-1">FULL TIME</div>
                </div>
              </div>
            </div>
            
            {/* Away Team with Logo */}
            <div className="flex-1 flex flex-col items-center max-w-[100px]">
              <TeamLogoDisplay
                teamName={awayTeamName}
                teamLogo={fixture?.away_team?.logo}
                teamColor={fixture?.away_team?.color || "#7c3aed"}
                size="sm"
              />
              <div className="mt-3 text-center">
                <div className="font-bold text-base leading-tight break-words text-center">
                  {awayTeamName}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop layout with enhanced styling */
        <div className="space-y-6">
          {/* Match Info */}
          <div className="text-center pt-2">
            <div className="text-base text-slate-300 font-medium">{getMatchDate()}</div>
          </div>
          
          {/* Teams and Score */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="flex flex-col items-center">
                <TeamLogoDisplay
                  teamName={homeTeamName}
                  teamLogo={fixture?.home_team?.logo}
                  teamColor={fixture?.home_team?.color || "#1f2937"}
                  size="md"
                />
                <div className="mt-4 text-2xl font-bold text-center">{homeTeamName}</div>
              </div>
            </div>
            
            {/* Enhanced Score */}
            <div className="px-8">
              <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-xl px-8 py-5 backdrop-blur-sm shadow-xl border border-white/20">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2 tracking-tight">
                    {homeScore} - {awayScore}
                  </div>
                  <div className="text-sm text-slate-200 font-medium">FULL TIME</div>
                </div>
              </div>
            </div>
            
            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="flex flex-col items-center">
                <TeamLogoDisplay
                  teamName={awayTeamName}
                  teamLogo={fixture?.away_team?.logo}
                  teamColor={fixture?.away_team?.color || "#7c3aed"}
                  size="md"
                />
                <div className="mt-4 text-2xl font-bold text-center">{awayTeamName}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremierLeagueHeader;
