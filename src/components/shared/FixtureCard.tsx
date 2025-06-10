
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay } from "@/utils/timeUtils";
import { getResponsiveTeamName } from "@/utils/teamNameUtils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import TeamLogo from "../teams/TeamLogo";
import MobilePortraitFixtureCard from "./MobilePortraitFixtureCard";

interface FixtureCardProps {
  fixture: Fixture;
  onClick?: (fixture: Fixture) => void;
  showDate?: boolean;
  className?: string;
}

const FixtureCard = ({ fixture, onClick, showDate = true, className = "" }: FixtureCardProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  
  // Use mobile portrait layout for screens ≤ 480px in portrait mode
  const shouldUseMobilePortrait = isMobile && isPortrait && window.innerWidth <= 480;

  if (shouldUseMobilePortrait) {
    return (
      <MobilePortraitFixtureCard 
        fixture={fixture}
        onClick={onClick}
        showDate={showDate}
        className={className}
      />
    );
  }

  // Default layout for larger screens and landscape
  const handleClick = () => {
    if (onClick && fixture.status === 'completed') {
      onClick(fixture);
    }
  };

  const homeTeamNames = getResponsiveTeamName(fixture.home_team?.name || 'TBD');
  const awayTeamNames = getResponsiveTeamName(fixture.away_team?.name || 'TBD');

  return (
    <div 
      className={`relative p-3 sm:p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 ${
        fixture.status === 'completed' ? 'cursor-pointer group hover:shadow-md border border-transparent hover:border-muted-foreground/20' : ''
      } ${className}`}
      onClick={handleClick}
    >
      {/* Match date - top right */}
      {showDate && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-xs text-muted-foreground">
          {formatDateDisplay(fixture.match_date)}
        </div>
      )}
      
      {/* Eye icon - top right, appears on hover for completed matches */}
      {fixture.status === 'completed' && (
        <div className="absolute top-2 right-14 sm:top-3 sm:right-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </div>
      )}
      
      {/* Main match content - responsive layout */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8">
        {/* Home team */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
          {/* Team name with responsive display */}
          <div className="font-medium text-xs sm:text-sm truncate text-right">
            <span className="hidden sm:inline">{homeTeamNames.full}</span>
            <span className="inline sm:hidden">{homeTeamNames.mobile}</span>
          </div>
          <div className="flex-shrink-0">
            <TeamLogo team={fixture.home_team} size="small" />
          </div>
        </div>
        
        {/* Score - responsive sizing */}
        <div className="flex items-center justify-center flex-shrink-0">
          <Badge variant="outline" className="px-2 py-1 sm:px-4 sm:py-2 font-bold text-sm sm:text-lg min-w-[60px] sm:min-w-[80px] text-center">
            {fixture.home_score || 0} - {fixture.away_score || 0}
          </Badge>
        </div>
        
        {/* Away team */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-start">
          <div className="flex-shrink-0">
            <TeamLogo team={fixture.away_team} size="small" />
          </div>
          {/* Team name with responsive display */}
          <div className="font-medium text-xs sm:text-sm truncate">
            <span className="hidden sm:inline">{awayTeamNames.full}</span>
            <span className="inline sm:hidden">{awayTeamNames.mobile}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
