
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay } from "@/utils/timeUtils";
import { getTeamAbbreviation, shouldUseAbbreviation } from "@/utils/teamNameUtils";
import TeamLogo from "../teams/TeamLogo";
import { useIsMobile } from "@/hooks/use-mobile";

interface FixtureCardProps {
  fixture: Fixture;
  onClick?: (fixture: Fixture) => void;
  showDate?: boolean;
  className?: string;
}

const FixtureCard = ({ fixture, onClick, showDate = true, className = "" }: FixtureCardProps) => {
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    if (onClick && fixture.status === 'completed') {
      onClick(fixture);
    }
  };

  const getDisplayName = (teamName: string) => {
    if (!teamName) return 'TBD';
    if (isMobile && shouldUseAbbreviation(teamName, 10)) {
      return getTeamAbbreviation(teamName);
    }
    return teamName;
  };

  return (
    <div 
      className={`relative rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 ${
        fixture.status === 'completed' ? 'cursor-pointer group hover:shadow-md border border-transparent hover:border-muted-foreground/20' : ''
      } ${isMobile ? 'p-3' : 'p-4'} ${className}`}
      onClick={handleClick}
    >
      {/* Match date - top right */}
      {showDate && (
        <div className={`absolute top-2 right-2 text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
          {formatDateDisplay(fixture.match_date)}
        </div>
      )}
      
      {/* Eye icon - top right, appears on hover for completed matches */}
      {fixture.status === 'completed' && (
        <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity ${
          isMobile ? 'top-2 right-12' : 'top-3 right-20'
        }`}>
          <Eye className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </div>
      )}
      
      {/* Main match content */}
      {isMobile ? (
        // Mobile: Stack teams vertically
        <div className="flex flex-col items-center space-y-3 pt-4">
          {/* Home team */}
          <div className="flex items-center gap-2 w-full justify-center">
            <TeamLogo team={fixture.home_team} size="small" />
            <span className="font-medium text-sm text-center">
              {getDisplayName(fixture.home_team?.name || 'TBD')}
            </span>
          </div>
          
          {/* Score */}
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="px-3 py-1 font-bold text-base min-w-[60px] text-center">
              {fixture.home_score || 0} - {fixture.away_score || 0}
            </Badge>
          </div>
          
          {/* Away team */}
          <div className="flex items-center gap-2 w-full justify-center">
            <TeamLogo team={fixture.away_team} size="small" />
            <span className="font-medium text-sm text-center">
              {getDisplayName(fixture.away_team?.name || 'TBD')}
            </span>
          </div>
        </div>
      ) : (
        // Desktop: Horizontal layout
        <div className="flex items-center justify-center gap-8">
          {/* Home team */}
          <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
            <span className="font-medium text-sm truncate">
              {fixture.home_team?.name || 'TBD'}
            </span>
            <TeamLogo team={fixture.home_team} size="small" />
          </div>
          
          {/* Score */}
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="px-4 py-2 font-bold text-lg min-w-[80px] text-center">
              {fixture.home_score || 0} - {fixture.away_score || 0}
            </Badge>
          </div>
          
          {/* Away team */}
          <div className="flex items-center gap-3 min-w-0 flex-1 justify-start">
            <TeamLogo team={fixture.away_team} size="small" />
            <span className="font-medium text-sm truncate">
              {fixture.away_team?.name || 'TBD'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixtureCard;
