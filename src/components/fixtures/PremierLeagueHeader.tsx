
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import TeamLogoDisplay from "./TeamLogoDisplay";

interface PremierLeagueHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const PremierLeagueHeader = ({ fixture, homeTeamColor, awayTeamColor }: PremierLeagueHeaderProps) => {
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-3"
        style={{
          background: `linear-gradient(to right, ${homeTeamColor} 0%, ${homeTeamColor} 50%, ${awayTeamColor} 50%, ${awayTeamColor} 100%)`
        }}
      />
      <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-6 md:gap-0">
          {/* Home Team - Mobile First Design */}
          <div className="flex flex-col items-center min-w-0 md:min-w-[200px]">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home Team'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={homeTeamColor}
              size="md"
              showName={true}
              isPremierLeagueStyle={true}
            />
            <div className="text-4xl md:text-6xl font-bold mt-3 md:mt-4 mb-2" style={{ color: homeTeamColor }}>
              {fixture.home_score || 0}
            </div>
          </div>
          
          {/* Match Status Display - Mobile Optimized */}
          <div className="flex flex-col items-center px-4 md:px-8 min-w-0 md:min-w-[200px] order-first md:order-none">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <Trophy className="h-4 w-4 md:h-6 md:w-6 text-yellow-600" />
              <Badge variant="outline" className="text-sm md:text-xl px-3 md:px-6 py-1 md:py-2 font-bold bg-gradient-to-r from-blue-50 to-green-50">
                {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
              </Badge>
            </div>
            <div className="w-16 md:w-20 h-0.5 md:h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-600 rounded-full"></div>
            <div className="text-xs md:text-sm text-muted-foreground mt-2 md:mt-3 text-center font-medium">
              {fixture.match_date}
            </div>
            {fixture.venue && (
              <div className="text-xs text-muted-foreground text-center mt-1">
                📍 {fixture.venue}
              </div>
            )}
          </div>
          
          {/* Away Team - Mobile First Design */}
          <div className="flex flex-col items-center min-w-0 md:min-w-[200px]">
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away Team'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={awayTeamColor}
              size="md"
              showName={true}
              isPremierLeagueStyle={true}
            />
            <div className="text-4xl md:text-6xl font-bold mt-3 md:mt-4 mb-2" style={{ color: awayTeamColor }}>
              {fixture.away_score || 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremierLeagueHeader;
