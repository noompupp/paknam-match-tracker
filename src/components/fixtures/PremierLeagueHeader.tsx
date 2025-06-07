
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MapPin, Calendar } from "lucide-react";
import TeamLogoDisplay from "./TeamLogoDisplay";

interface PremierLeagueHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const PremierLeagueHeader = ({ fixture, homeTeamColor, awayTeamColor }: PremierLeagueHeaderProps) => {
  return (
    <Card className="overflow-hidden max-w-4xl mx-auto">
      <div 
        className="h-2 md:h-3"
        style={{
          background: `linear-gradient(to right, ${homeTeamColor} 0%, ${homeTeamColor} 50%, ${awayTeamColor} 50%, ${awayTeamColor} 100%)`
        }}
      />
      <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
        {/* Match Status Header - Mobile First */}
        <div className="flex flex-col items-center mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
            <Badge variant="outline" className="text-xs md:text-sm px-2 md:px-4 py-1 font-bold bg-gradient-to-r from-blue-50 to-green-50">
              {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
            </Badge>
          </div>
          
          {/* Match Details Row */}
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
            {fixture.match_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                <span className="font-medium">{fixture.match_date}</span>
              </div>
            )}
            {fixture.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                <span className="font-medium truncate max-w-[120px] md:max-w-none">{fixture.venue}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Teams and Score Layout - Maintains side-by-side on mobile */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home Team'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={homeTeamColor}
              size="md"
              showName={true}
              isPremierLeagueStyle={true}
            />
          </div>
          
          {/* Score Display - Compact for mobile */}
          <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-center" style={{ color: homeTeamColor }}>
              {fixture.home_score || 0}
            </div>
            <div className="text-lg md:text-2xl font-bold text-muted-foreground">-</div>
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-center" style={{ color: awayTeamColor }}>
              {fixture.away_score || 0}
            </div>
          </div>
          
          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away Team'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={awayTeamColor}
              size="md"
              showName={true}
              isPremierLeagueStyle={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremierLeagueHeader;
