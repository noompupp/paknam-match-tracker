
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";

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
    <Card className="overflow-hidden">
      <CardContent className="p-6">
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
                className="text-4xl font-bold"
                style={{ color: homeTeamColor }}
              >
                {fixture.home_score || 0}
              </div>
            </div>
          </div>

          {/* Center Section with FULL TIME status */}
          <div className="text-center px-8">
            <Badge 
              variant={fixture.status === 'completed' ? 'default' : 'outline'}
              className="mb-3 text-sm px-4 py-1 font-bold"
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
                className="text-4xl font-bold"
                style={{ color: awayTeamColor }}
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

        {/* Match Info Bar - Now positioned after teams */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-6 pt-4 border-t">
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
