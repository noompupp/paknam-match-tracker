
import { Badge } from "@/components/ui/badge";
import TeamLogoDisplay from "../TeamLogoDisplay";
import { getNeutralScoreStyle } from "@/utils/scoreColorUtils";
import MatchResultBadge from "./MatchResultBadge";

interface CompactMobileMatchHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const CompactMobileMatchHeader = ({ 
  fixture, 
  homeTeamColor, 
  awayTeamColor 
}: CompactMobileMatchHeaderProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 items-center w-full min-h-[80px] py-2">
      
      {/* Home Team Column - Compact */}
      <div className="flex flex-col items-center justify-center">
        <TeamLogoDisplay 
          teamName={fixture.home_team?.name || 'Home'}
          teamLogo={fixture.home_team?.logoURL}
          teamColor={homeTeamColor}
          size="xs"
          showName={false}
        />
        <div className="mt-1 text-center">
          <div className="text-xs text-muted-foreground mb-0.5 max-w-[60px] truncate text-[10px] leading-tight">
            {fixture.home_team?.name || 'Home'}
          </div>
          <div 
            className="text-2xl font-bold leading-none"
            style={getNeutralScoreStyle(true)}
          >
            {fixture.home_score || 0}
          </div>
        </div>
      </div>

      {/* Center Column - Minimal Match Info */}
      <div className="flex flex-col items-center justify-center px-1">
        <Badge 
          variant={fixture.status === 'completed' ? 'default' : 'outline'}
          className="mb-1 text-xs px-1.5 py-0.5 font-bold text-[10px]"
        >
          {fixture.status === 'completed' ? 'FT' : fixture.status?.toUpperCase() || 'MATCH'}
        </Badge>
        
        <div className="text-sm font-light text-muted-foreground mb-1">VS</div>
        
        <MatchResultBadge fixture={fixture} className="text-xs" />
      </div>

      {/* Away Team Column - Compact */}
      <div className="flex flex-col items-center justify-center">
        <TeamLogoDisplay 
          teamName={fixture.away_team?.name || 'Away'}
          teamLogo={fixture.away_team?.logoURL}
          teamColor={awayTeamColor}
          size="xs"
          showName={false}
        />
        <div className="mt-1 text-center">
          <div className="text-xs text-muted-foreground mb-0.5 max-w-[60px] truncate text-[10px] leading-tight">
            {fixture.away_team?.name || 'Away'}
          </div>
          <div 
            className="text-2xl font-bold leading-none"
            style={getNeutralScoreStyle(true)}
          >
            {fixture.away_score || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactMobileMatchHeader;
