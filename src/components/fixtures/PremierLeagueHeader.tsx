
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, MapPin } from "lucide-react";
import TeamLogoDisplay from "./TeamLogoDisplay";

interface PremierLeagueHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const PremierLeagueHeader = ({ fixture, homeTeamColor, awayTeamColor }: PremierLeagueHeaderProps) => {
  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'live':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse';
      case 'scheduled':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
    }
  };

  const getScoreGradient = (teamColor: string) => {
    return {
      background: `linear-gradient(135deg, ${teamColor}, ${teamColor}dd, ${teamColor}bb)`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
    };
  };

  return (
    <Card className="overflow-hidden shadow-2xl">
      {/* Enhanced Team Color Gradient Header */}
      <div 
        className="h-4 relative"
        style={{
          background: `linear-gradient(135deg, ${homeTeamColor} 0%, ${homeTeamColor}dd 25%, ${homeTeamColor}aa 50%, ${awayTeamColor}aa 50%, ${awayTeamColor}dd 75%, ${awayTeamColor} 100%)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
      </div>

      <CardContent className="pt-8 pb-8 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="flex items-center justify-between mb-8">
          {/* Home Team - Enhanced with Gradient Effects */}
          <div className="flex flex-col items-center min-w-[180px] group">
            <div className="transform transition-all duration-300 group-hover:scale-105">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home Team'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={homeTeamColor}
                size="lg"
                showName={true}
              />
            </div>
            <div 
              className="text-7xl font-black mt-6 mb-2 drop-shadow-lg"
              style={getScoreGradient(homeTeamColor)}
            >
              {fixture.home_score || 0}
            </div>
            <div className="w-16 h-1 rounded-full shadow-sm" style={{ backgroundColor: homeTeamColor }}></div>
          </div>
          
          {/* Enhanced Match Status Display with Premier League Styling */}
          <div className="flex flex-col items-center px-8 min-w-[240px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-full shadow-lg">
                <Trophy className="h-7 w-7 text-yellow-900" />
              </div>
              <Badge 
                variant="outline" 
                className={`text-xl px-8 py-3 font-black border-2 shadow-lg ${getStatusGradient(fixture.status || 'match')}`}
              >
                {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
              </Badge>
            </div>
            
            {/* Enhanced Divider with Gradient */}
            <div className="w-32 h-2 bg-gradient-to-r from-primary via-primary/60 to-primary rounded-full shadow-md mb-4"></div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <Clock className="h-4 w-4" />
                <span>{fixture.match_date}</span>
              </div>
              {fixture.venue && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  <span className="bg-slate-100 px-2 py-1 rounded-full">{fixture.venue}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Away Team - Enhanced with Gradient Effects */}
          <div className="flex flex-col items-center min-w-[180px] group">
            <div className="transform transition-all duration-300 group-hover:scale-105">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away Team'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={awayTeamColor}
                size="lg"
                showName={true}
              />
            </div>
            <div 
              className="text-7xl font-black mt-6 mb-2 drop-shadow-lg"
              style={getScoreGradient(awayTeamColor)}
            >
              {fixture.away_score || 0}
            </div>
            <div className="w-16 h-1 rounded-full shadow-sm" style={{ backgroundColor: awayTeamColor }}></div>
          </div>
        </div>

        {/* Enhanced Match Info Footer */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl p-4 border border-slate-200/50">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"></div>
              <span className="font-medium">Paknam FC League</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="text-slate-500 font-medium">
              {fixture.status === 'completed' ? 'Match Completed' : 'Live Match'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremierLeagueHeader;
