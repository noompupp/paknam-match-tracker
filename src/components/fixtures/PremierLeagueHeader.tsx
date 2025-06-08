
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "./TeamLogoDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { shortenTeamName } from "@/utils/teamNameUtils";

interface PremierLeagueHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const PremierLeagueHeader = ({ fixture, homeTeamColor, awayTeamColor }: PremierLeagueHeaderProps) => {
  const isMobile = useIsMobile();

  const getResponsiveTeamName = (teamName: string) => {
    if (!isMobile) return teamName;
    return shortenTeamName(teamName, 10);
  };

  return (
    <Card className="overflow-hidden premier-card-shadow-lg match-border-gradient">
      <div 
        className="h-3"
        style={{
          background: `linear-gradient(to right, ${homeTeamColor} 0%, ${homeTeamColor} 50%, ${awayTeamColor} 50%, ${awayTeamColor} 100%)`
        }}
      />
      <CardContent className={`${isMobile ? 'pt-6 pb-6 px-4' : 'pt-8 pb-8'} match-gradient-header`}>
        {/* Mobile: Enhanced Vertical Layout */}
        {isMobile ? (
          <div className="flex flex-col items-center w-full space-y-6">
            {/* Home Team - Larger logos and better alignment */}
            <div className="flex flex-col items-center w-full">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home Team'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={homeTeamColor}
                size="lg"
                showName={false}
              />
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-muted-foreground mb-2 leading-tight max-w-[160px] break-words">
                  {getResponsiveTeamName(fixture.home_team?.name || 'Home Team')}
                </div>
                <div 
                  className="font-bold text-4xl leading-none score-text-outline"
                  style={{ color: homeTeamColor }}
                >
                  {fixture.home_score || 0}
                </div>
              </div>
            </div>

            {/* Match Status - Enhanced center section */}
            <div className="flex flex-col items-center px-4 w-full py-4 match-gradient-primary rounded-lg border border-primary/20">
              <Badge 
                variant={fixture.status === 'completed' ? 'default' : 'outline'} 
                className="mb-3 text-sm px-4 py-1.5 font-bold bg-gradient-to-r from-primary/80 to-primary/60"
              >
                {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
              </Badge>
              
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/40 via-primary/80 to-primary/40 rounded-full mb-4"></div>
              
              <div className="text-sm text-muted-foreground text-center font-medium mb-1">
                {fixture.match_date}
              </div>
              
              {fixture.kick_off_time && (
                <div className="text-xs text-muted-foreground text-center mb-2">
                  Kick-off: {fixture.kick_off_time}
                </div>
              )}
              
              {fixture.venue && (
                <div className="text-xs text-muted-foreground text-center px-2">
                  <div className="break-words max-w-[260px] leading-relaxed">
                    📍 {fixture.venue}
                  </div>
                </div>
              )}
            </div>

            {/* Away Team - Consistent with home team styling */}
            <div className="flex flex-col items-center w-full">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away Team'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={awayTeamColor}
                size="lg"
                showName={false}
              />
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-muted-foreground mb-2 leading-tight max-w-[160px] break-words">
                  {getResponsiveTeamName(fixture.away_team?.name || 'Away Team')}
                </div>
                <div 
                  className="font-bold text-4xl leading-none score-text-outline"
                  style={{ color: awayTeamColor }}
                >
                  {fixture.away_score || 0}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop: Enhanced Horizontal Layout */
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex flex-col items-center min-w-[180px] p-4 rounded-lg stat-block-home-gradient premier-card-shadow">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home Team'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={homeTeamColor}
                size="lg"
                showName={true}
              />
              <div 
                className="font-bold text-6xl mt-4 mb-2 score-text-outline"
                style={{ color: homeTeamColor }}
              >
                {fixture.home_score || 0}
              </div>
            </div>
            
            {/* Match Status - Premier League style with gradients */}
            <div className="flex flex-col items-center px-8 min-w-[220px] py-6 match-gradient-primary rounded-lg border border-primary/20 premier-card-shadow">
              <Badge 
                variant={fixture.status === 'completed' ? 'default' : 'outline'} 
                className="text-xl px-6 py-2 font-bold mb-4 bg-gradient-to-r from-primary/80 to-primary/60"
              >
                {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
              </Badge>
              
              <div className="text-3xl font-light text-muted-foreground mb-4">VS</div>
              <div className="w-24 h-1 bg-gradient-to-r from-primary/40 via-primary/80 to-primary/40 rounded-full mb-4"></div>
              
              <div className="text-sm text-muted-foreground text-center font-medium mb-1">
                {fixture.match_date}
              </div>
              
              {fixture.kick_off_time && (
                <div className="text-xs text-muted-foreground text-center mb-1">
                  Kick-off: {fixture.kick_off_time}
                </div>
              )}
              
              {fixture.venue && (
                <div className="text-xs text-muted-foreground text-center">
                  📍 {fixture.venue}
                </div>
              )}
            </div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center min-w-[180px] p-4 rounded-lg stat-block-away-gradient premier-card-shadow">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away Team'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={awayTeamColor}
                size="lg"
                showName={true}
              />
              <div 
                className="font-bold text-6xl mt-4 mb-2 score-text-outline"
                style={{ color: awayTeamColor }}
              >
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
