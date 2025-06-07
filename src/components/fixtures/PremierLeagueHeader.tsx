
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
      <CardContent className={`${isMobile ? 'pt-4 pb-4' : 'pt-8 pb-8'}`}>
        <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-8'}`}>
          {/* Home Team - Responsive Logo Display */}
          <div className={`flex flex-col items-center ${isMobile ? 'min-w-[100px]' : 'min-w-[160px]'}`}>
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home Team'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={homeTeamColor}
              size={isMobile ? "md" : "lg"}
              showName={true}
            />
            <div className={`font-bold ${isMobile ? 'text-3xl mt-2 mb-1' : 'text-6xl mt-4 mb-2'}`} style={{ color: homeTeamColor }}>
              {fixture.home_score || 0}
            </div>
          </div>
          
          {/* Enhanced Match Status Display - Mobile Responsive */}
          <div className={`flex flex-col items-center ${isMobile ? 'px-3 min-w-[120px]' : 'px-8 min-w-[200px]'}`}>
            <div className={`flex items-center gap-${isMobile ? '2' : '3'} ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-yellow-600`} />
              <Badge variant="outline" className={`${isMobile ? 'text-sm px-3 py-1' : 'text-xl px-6 py-2'} font-bold bg-gradient-to-r from-blue-50 to-green-50`}>
                {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
              </Badge>
            </div>
            <div className={`${isMobile ? 'w-12 h-0.5' : 'w-20 h-1'} bg-gradient-to-r from-gray-300 via-gray-500 to-gray-600 rounded-full`}></div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground ${isMobile ? 'mt-2' : 'mt-3'} text-center font-medium`}>
              {fixture.match_date}
            </div>
            {fixture.venue && (
              <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground text-center mt-1`}>
                📍 {isMobile ? fixture.venue.split(' ').slice(0, 2).join(' ') : fixture.venue}
              </div>
            )}
          </div>
          
          {/* Away Team - Responsive Logo Display */}
          <div className={`flex flex-col items-center ${isMobile ? 'min-w-[100px]' : 'min-w-[160px]'}`}>
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away Team'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={awayTeamColor}
              size={isMobile ? "md" : "lg"}
              showName={true}
            />
            <div className={`font-bold ${isMobile ? 'text-3xl mt-2 mb-1' : 'text-6xl mt-4 mb-2'}`} style={{ color: awayTeamColor }}>
              {fixture.away_score || 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremierLeagueHeader;
