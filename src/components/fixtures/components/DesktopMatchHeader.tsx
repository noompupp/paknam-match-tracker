
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";
import { getScoreStyle } from "@/utils/scoreColorUtils";
import MatchResultBadge from "./MatchResultBadge";

interface DesktopMatchHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const DesktopMatchHeader = ({ fixture, homeTeamColor, awayTeamColor }: DesktopMatchHeaderProps) => {
  return (
    <>
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
          <MatchResultBadge fixture={fixture} />
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
    </>
  );
};

export default DesktopMatchHeader;
