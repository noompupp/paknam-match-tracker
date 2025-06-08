
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";
import { getScoreStyle } from "@/utils/scoreColorUtils";
import MatchResultBadge from "./MatchResultBadge";

interface MobileMatchHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const MobileMatchHeader = ({ fixture, homeTeamColor, awayTeamColor }: MobileMatchHeaderProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 items-center w-full min-h-[140px]">
      
      {/* Home Team Column */}
      <div className="flex flex-col items-center justify-center h-full">
        <TeamLogoDisplay 
          teamName={fixture.home_team?.name || 'Home'}
          teamLogo={fixture.home_team?.logoURL}
          teamColor={homeTeamColor}
          size="sm"
          showName={false}
        />
        <div className="mt-2 text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1 max-w-[80px] truncate leading-tight">
            {fixture.home_team?.name || 'Home'}
          </div>
          <div 
            className="text-2xl font-bold score-text-outline leading-none"
            style={getScoreStyle(homeTeamColor)}
          >
            {fixture.home_score || 0}
          </div>
        </div>
      </div>

      {/* Center Column - Match Info & Status */}
      <div className="flex flex-col items-center justify-center px-2 h-full">
        <Badge 
          variant={fixture.status === 'completed' ? 'default' : 'outline'}
          className="mb-2 text-xs px-2 py-1 font-bold bg-gradient-to-r from-primary/80 to-primary/60"
        >
          {fixture.status === 'completed' ? 'FT' : fixture.status?.toUpperCase() || 'MATCH'}
        </Badge>
        
        <div className="text-lg font-light text-muted-foreground mb-2">VS</div>
        
        <MatchResultBadge fixture={fixture} className="mb-2" />

        {/* Match Details - Compact */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="truncate max-w-[70px]">{fixture.match_date}</span>
          </div>
          
          {fixture.kick_off_time && (
            <div className="truncate max-w-[80px]">
              {fixture.kick_off_time}
            </div>
          )}
          
          {fixture.venue && (
            <div className="flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[70px]">{fixture.venue}</span>
            </div>
          )}
        </div>
      </div>

      {/* Away Team Column */}
      <div className="flex flex-col items-center justify-center h-full">
        <TeamLogoDisplay 
          teamName={fixture.away_team?.name || 'Away'}
          teamLogo={fixture.away_team?.logoURL}
          teamColor={awayTeamColor}
          size="sm"
          showName={false}
        />
        <div className="mt-2 text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1 max-w-[80px] truncate leading-tight">
            {fixture.away_team?.name || 'Away'}
          </div>
          <div 
            className="text-2xl font-bold score-text-outline leading-none"
            style={getScoreStyle(awayTeamColor)}
          >
            {fixture.away_score || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMatchHeader;
