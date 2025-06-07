
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";

interface PremierLeagueMatchHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const PremierLeagueMatchHeader = ({ fixture, homeTeamColor, awayTeamColor }: PremierLeagueMatchHeaderProps) => {
  // Enhanced color fallback system
  const getEnhancedTeamColor = (color: string, fallback: string) => {
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white') {
      return fallback;
    }
    return color;
  };

  const enhancedHomeColor = getEnhancedTeamColor(homeTeamColor, '#1f2937');
  const enhancedAwayColor = getEnhancedTeamColor(awayTeamColor, '#7c3aed');

  // Enhanced gradient for white teams
  const createColorBarGradient = (homeColor: string, awayColor: string) => {
    const isHomeWhite = homeTeamColor === '#ffffff' || homeTeamColor === '#FFFFFF' || homeTeamColor === 'white';
    const isAwayWhite = awayTeamColor === '#ffffff' || awayTeamColor === '#FFFFFF' || awayTeamColor === 'white';

    if (isHomeWhite && isAwayWhite) {
      return `linear-gradient(to right, #e5e7eb 0%, #e5e7eb 25%, #9ca3af 25%, #9ca3af 75%, #e5e7eb 75%, #e5e7eb 100%)`;
    } else if (isHomeWhite) {
      return `linear-gradient(to right, #e5e7eb 0%, #e5e7eb 25%, #9ca3af 25%, #9ca3af 45%, ${awayColor} 55%, ${awayColor} 100%)`;
    } else if (isAwayWhite) {
      return `linear-gradient(to right, ${homeColor} 0%, ${homeColor} 45%, #9ca3af 55%, #9ca3af 75%, #e5e7eb 75%, #e5e7eb 100%)`;
    }
    
    return `linear-gradient(to right, ${homeColor} 0%, ${homeColor} 50%, ${awayColor} 50%, ${awayColor} 100%)`;
  };

  const getResult = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'Home Win';
    if (awayScore > homeScore) return 'Away Win';
    return 'Draw';
  };

  const getResultColor = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'text-green-600';
    if (awayScore > homeScore) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <Card className="overflow-hidden animate-fade-in">
      {/* Enhanced Team Color Bar with gradient */}
      <div 
        className="h-3 relative overflow-hidden"
        style={{
          background: createColorBarGradient(enhancedHomeColor, enhancedAwayColor)
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      </div>
      
      <CardContent className="p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Match Info Bar with improved spacing */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-200">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{fixture.match_date}</span>
          </div>
          {fixture.venue && (
            <>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2 hover:text-foreground transition-colors duration-200">
                <MapPin className="h-4 w-4" />
                <span className="font-medium truncate max-w-[200px]">{fixture.venue}</span>
              </div>
            </>
          )}
          <span className="text-slate-300">•</span>
          <Badge 
            variant="outline" 
            className="bg-white border-2 font-bold text-sm px-4 py-1.5 hover:bg-slate-50 transition-colors duration-200"
          >
            {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
          </Badge>
        </div>

        {/* Teams and Score - Enhanced Typography and Alignment */}
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex items-center gap-6 flex-1 animate-scale-in">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={enhancedHomeColor}
              size="lg"
              showName={false}
            />
            <div className="text-center">
              <div className="text-lg font-bold text-muted-foreground mb-3 leading-tight">
                {fixture.home_team?.name || 'Home'}
              </div>
              <div 
                className="text-7xl font-black leading-none tabular-nums tracking-tight"
                style={{ 
                  color: enhancedHomeColor,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {fixture.home_score || 0}
              </div>
            </div>
          </div>

          {/* Center Score Separator - Enhanced Design */}
          <div className="text-center px-12">
            <div className="text-4xl font-extralight text-slate-300 mb-4 animate-pulse">—</div>
            <Badge 
              variant="outline" 
              className={`${getResultColor()} border-2 font-bold text-lg px-6 py-2 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}
            >
              {getResult()}
            </Badge>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-6 flex-1 justify-end animate-scale-in">
            <div className="text-center">
              <div className="text-lg font-bold text-muted-foreground mb-3 leading-tight">
                {fixture.away_team?.name || 'Away'}
              </div>
              <div 
                className="text-7xl font-black leading-none tabular-nums tracking-tight"
                style={{ 
                  color: enhancedAwayColor,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {fixture.away_score || 0}
              </div>
            </div>
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={enhancedAwayColor}
              size="lg"
              showName={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremierLeagueMatchHeader;
