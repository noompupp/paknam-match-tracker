
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
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
      <CardContent className={`${isMobile ? 'pt-6 pb-6' : 'pt-8 pb-8'}`}>
        {/* Mobile: Vertical Layout with Centered Content */}
        {isMobile ? (
          <div className="flex flex-col items-center w-full max-w-[375px] mx-auto space-y-6">
            {/* Home Team */}
            <div className="flex flex-col items-center">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home Team'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={homeTeamColor}
                size="lg"
                showName={true}
              />
              <div className="font-bold text-5xl mt-3 mb-2" style={{ color: homeTeamColor }}>
                {fixture.home_score || 0}
              </div>
            </div>

            {/* Match Status - Centered */}
            <div className="flex flex-col items-center px-4 w-full">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <Badge variant="outline" className="text-lg px-4 py-2 font-bold bg-gradient-to-r from-blue-50 to-green-50">
                  {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
                </Badge>
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-600 rounded-full"></div>
              <div className="text-sm text-muted-foreground mt-3 text-center font-medium">
                {fixture.match_date}
              </div>
              {fixture.venue && (
                <div className="text-sm text-muted-foreground text-center mt-1 px-2">
                  <div className="break-words whitespace-break-spaces">
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
                size="lg"
                showName={true}
              />
              <div className="font-bold text-5xl mt-3 mb-2" style={{ color: awayTeamColor }}>
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop: Horizontal Layout */
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
            
            {/* Match Status */}
            <div className="flex flex-col items-center px-8 min-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <Badge variant="outline" className="text-xl px-6 py-2 font-bold bg-gradient-to-r from-blue-50 to-green-50">
                  {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
                </Badge>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-600 rounded-full"></div>
              <div className="text-sm text-muted-foreground mt-3 text-center font-medium">
                {fixture.match_date}
              </div>
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
