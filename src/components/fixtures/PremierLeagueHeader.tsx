
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "./TeamLogoDisplay";
import { useIsMobile } from "@/hooks/use-mobile";

interface PremierLeagueHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const PremierLeagueHeader = ({ fixture, homeTeamColor, awayTeamColor }: PremierLeagueHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="overflow-hidden">
      <div 
        className="h-3"
        style={{
          background: `linear-gradient(to right, ${homeTeamColor} 0%, ${homeTeamColor} 50%, ${awayTeamColor} 50%, ${awayTeamColor} 100%)`
        }}
      />
      <CardContent className={`${isMobile ? 'pt-4 pb-4' : 'pt-8 pb-8'}`}>
        {/* Mobile: Vertical Layout with Export-Optimized Spacing */}
        {isMobile ? (
          <div className="flex flex-col items-center w-full space-y-4">
            {/* Home Team */}
            <div className="flex flex-col items-center">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home Team'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={homeTeamColor}
                size="md"
                showName={true}
              />
              <div className="font-bold text-3xl mt-2 mb-1" style={{ color: homeTeamColor }}>
                {fixture.home_score || 0}
              </div>
            </div>

            {/* Match Status - Centered with FULL TIME */}
            <div className="flex flex-col items-center px-2 w-full">
              <Badge 
                variant={fixture.status === 'completed' ? 'default' : 'outline'} 
                className="mb-2 text-sm px-3 py-1 font-bold"
              >
                {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
              </Badge>
              <div className="w-12 h-0.5 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-600 rounded-full mb-3"></div>
              <div className="text-xs text-muted-foreground text-center font-medium">
                {fixture.match_date}
              </div>
              {fixture.kick_off_time && (
                <div className="text-xs text-muted-foreground text-center mt-1">
                  Kick-off: {fixture.kick_off_time}
                </div>
              )}
              {fixture.venue && (
                <div className="text-xs text-muted-foreground text-center mt-1 px-2">
                  <div className="break-words max-w-[280px]">
                    📍 {fixture.venue}
                  </div>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away Team'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={awayTeamColor}
                size="md"
                showName={true}
              />
              <div className="font-bold text-3xl mt-2 mb-1" style={{ color: awayTeamColor }}>
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop: Horizontal Layout with Premier League styling */
          <div className="flex items-center justify-between mb-8">
            {/* Home Team */}
            <div className="flex flex-col items-center min-w-[160px]">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home Team'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={homeTeamColor}
                size="lg"
                showName={true}
              />
              <div className="font-bold text-6xl mt-4 mb-2" style={{ color: homeTeamColor }}>
                {fixture.home_score || 0}
              </div>
            </div>
            
            {/* Match Status - Premier League style */}
            <div className="flex flex-col items-center px-8 min-w-[200px]">
              <Badge 
                variant={fixture.status === 'completed' ? 'default' : 'outline'} 
                className="text-xl px-6 py-2 font-bold mb-3"
              >
                {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
              </Badge>
              <div className="text-3xl font-light text-muted-foreground mb-3">VS</div>
              <div className="w-20 h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-600 rounded-full mb-3"></div>
              <div className="text-sm text-muted-foreground text-center font-medium">
                {fixture.match_date}
              </div>
              {fixture.kick_off_time && (
                <div className="text-xs text-muted-foreground text-center mt-1">
                  Kick-off: {fixture.kick_off_time}
                </div>
              )}
              {fixture.venue && (
                <div className="text-xs text-muted-foreground text-center mt-1">
                  📍 {fixture.venue}
                </div>
              )}
            </div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center min-w-[160px]">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away Team'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={awayTeamColor}
                size="lg"
                showName={true}
              />
              <div className="font-bold text-6xl mt-4 mb-2" style={{ color: awayTeamColor }}>
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PremierLeagueHeader;
