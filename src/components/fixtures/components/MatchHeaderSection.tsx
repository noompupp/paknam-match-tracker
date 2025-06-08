import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";
import { getScoreStyle } from "@/utils/scoreColorUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MatchHeaderSectionProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const MatchHeaderSection = ({
  fixture,
  homeTeamColor,
  awayTeamColor
}: MatchHeaderSectionProps) => {
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <Card className="overflow-hidden premier-card-shadow-lg match-border-gradient w-full">
        <CardContent className="p-3 match-gradient-header w-full">
          {/* Mobile Layout */}
          <div className="flex flex-col w-full space-y-4">
            {/* Home Team */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <TeamLogoDisplay 
                  teamName={fixture.home_team?.name || 'Home'}
                  teamLogo={fixture.home_team?.logoURL}
                  teamColor={homeTeamColor}
                  size="md"
                  showName={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-muted-foreground mb-1 truncate">
                    {fixture.home_team?.name || 'Home'}
                  </div>
                </div>
              </div>
              <div 
                className="text-2xl font-bold score-text-outline flex-shrink-0"
                style={getScoreStyle(homeTeamColor)}
              >
                {fixture.home_score || 0}
              </div>
            </div>

            {/* Center Section */}
            <div className="text-center px-2 py-3 bg-gradient-to-r from-transparent via-muted/10 to-transparent rounded-lg">
              <Badge 
                variant={fixture.status === 'completed' ? 'default' : 'outline'}
                className="mb-2 text-xs px-3 py-1 font-bold bg-gradient-to-r from-primary/80 to-primary/60"
              >
                {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
              </Badge>
              <div className="text-lg font-light text-muted-foreground mb-2">VS</div>
              <Badge variant="outline" className={`text-xs ${getResultColor()}`}>
                {getResult()}
              </Badge>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between w-full">
              <div 
                className="text-2xl font-bold score-text-outline flex-shrink-0"
                style={getScoreStyle(awayTeamColor)}
              >
                {fixture.away_score || 0}
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-sm font-medium text-muted-foreground mb-1 truncate">
                    {fixture.away_team?.name || 'Away'}
                  </div>
                </div>
                <TeamLogoDisplay 
                  teamName={fixture.away_team?.name || 'Away'}
                  teamLogo={fixture.away_team?.logoURL}
                  teamColor={awayTeamColor}
                  size="md"
                  showName={false}
                />
              </div>
            </div>

            {/* Match Info Bar */}
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-primary/20">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{fixture.match_date}</span>
              </div>
              {fixture.kick_off_time && (
                <span>Kick-off: {fixture.kick_off_time}</span>
              )}
              {fixture.venue && (
                <div className="flex items-center gap-1 text-center">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{fixture.venue}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop Layout (unchanged)
  return (
    <Card className="overflow-hidden premier-card-shadow-lg match-border-gradient">
      <CardContent className="p-6 match-gradient-header">
        {/* Teams and Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={homeTeamColor}
              size="lg"
              showName={false}
            />
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {fixture.home_team?.name || 'Home'}
              </div>
              <div 
                className="text-4xl font-bold score-text-outline"
                style={getScoreStyle(homeTeamColor)}
              >
                {fixture.home_score || 0}
              </div>
            </div>
          </div>

          {/* Center Section with FULL TIME status */}
          <div className="text-center px-8">
            <Badge 
              variant={fixture.status === 'completed' ? 'default' : 'outline'}
              className="mb-3 text-sm px-4 py-1 font-bold bg-gradient-to-r from-primary/80 to-primary/60"
            >
              {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
            </Badge>
            <div className="text-3xl font-light text-muted-foreground mb-2">VS</div>
            <Badge variant="outline" className={getResultColor()}>
              {getResult()}
            </Badge>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {fixture.away_team?.name || 'Away'}
              </div>
              <div 
                className="text-4xl font-bold score-text-outline"
                style={getScoreStyle(awayTeamColor)}
              >
                {fixture.away_score || 0}
              </div>
            </div>
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={awayTeamColor}
              size="lg"
              showName={false}
            />
          </div>
        </div>

        {/* Match Info Bar - Enhanced with gradient */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-6 pt-4 border-t border-primary/20 bg-gradient-to-r from-transparent via-muted/10 to-transparent rounded-lg p-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{fixture.match_date}</span>
          </div>
          {fixture.kick_off_time && (
            <>
              <span>•</span>
              <span>Kick-off: {fixture.kick_off_time}</span>
            </>
          )}
          {fixture.venue && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{fixture.venue}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchHeaderSection;
