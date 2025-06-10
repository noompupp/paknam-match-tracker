
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Calendar } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import { getResponsiveTeamName } from "@/utils/teamNameUtils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import TeamLogo from "../../teams/TeamLogo";
import { cn } from "@/lib/utils";

interface CompactFixtureCardProps {
  fixture: Fixture;
  onPreviewClick?: (fixture: Fixture) => void;
  onSummaryClick?: (fixture: Fixture) => void;
  showDate?: boolean;
  className?: string;
}

const CompactFixtureCard = ({ 
  fixture, 
  onPreviewClick, 
  onSummaryClick, 
  showDate = true, 
  className = "" 
}: CompactFixtureCardProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const shouldUseMobilePortrait = isMobile && isPortrait && window.innerWidth <= 480;

  const homeTeamNames = getResponsiveTeamName(fixture.home_team?.name || 'TBD');
  const awayTeamNames = getResponsiveTeamName(fixture.away_team?.name || 'TBD');

  const handleCardClick = () => {
    if (fixture.status === 'completed' && onSummaryClick) {
      onSummaryClick(fixture);
    } else if (onPreviewClick) {
      onPreviewClick(fixture);
    }
  };

  const handleSummaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fixture.status === 'completed' && onSummaryClick) {
      onSummaryClick(fixture);
    }
  };

  const getStatusBadgeText = () => {
    switch (fixture.status) {
      case 'completed':
        return 'FT';
      case 'live':
        return 'LIVE';
      case 'scheduled':
        return 'VS';
      default:
        return fixture.status?.toUpperCase() || 'MATCH';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (fixture.status) {
      case 'completed':
        return 'default';
      case 'live':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (shouldUseMobilePortrait) {
    return (
      <div 
        className={cn(
          "relative p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 cursor-pointer group",
          "hover:shadow-md border border-transparent hover:border-muted-foreground/20",
          className
        )}
        onClick={handleCardClick}
      >
        {/* Date/Time - Top Right */}
        {showDate && (
          <div className="absolute top-2 right-2 text-xs text-muted-foreground max-w-[140px] text-right leading-tight">
            {formatDateDisplay(fixture.match_date)} • {formatTimeDisplay(fixture.match_time || '')}
          </div>
        )}

        {/* Summary Icon for completed matches */}
        {fixture.status === 'completed' && (
          <button
            onClick={handleSummaryClick}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 rounded-full hover:bg-muted/50"
            aria-label="View match summary"
          >
            <Eye className="h-3 w-3 text-muted-foreground" />
          </button>
        )}

        {/* 3-Column Mobile Portrait Layout */}
        <div className="grid grid-cols-3 gap-3 items-center min-h-[120px] mt-6">
          {/* Home Team */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <TeamLogo team={fixture.home_team} size="small" />
            <div className="text-center w-full">
              <div className="text-xs font-medium text-muted-foreground mb-1 leading-tight max-w-[80px] mx-auto">
                <span className="block truncate" title={homeTeamNames.full}>
                  {homeTeamNames.compact}
                </span>
              </div>
              {fixture.status === 'completed' && (
                <div className="text-2xl font-bold leading-none text-foreground">
                  {fixture.home_score || 0}
                </div>
              )}
            </div>
          </div>

          {/* Center Info */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <Badge 
              variant={getStatusBadgeVariant()}
              className={cn(
                "text-xs px-2 py-1 font-bold",
                fixture.status === 'live' && "animate-pulse"
              )}
            >
              {getStatusBadgeText()}
            </Badge>
            
            {fixture.status !== 'completed' && (
              <div className="text-lg font-light text-muted-foreground">VS</div>
            )}
            
            {fixture.status === 'completed' && (
              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <TeamLogo team={fixture.away_team} size="small" />
            <div className="text-center w-full">
              <div className="text-xs font-medium text-muted-foreground mb-1 leading-tight max-w-[80px] mx-auto">
                <span className="block truncate" title={awayTeamNames.full}>
                  {awayTeamNames.compact}
                </span>
              </div>
              {fixture.status === 'completed' && (
                <div className="text-2xl font-bold leading-none text-foreground">
                  {fixture.away_score || 0}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action hint */}
        <div className="text-center text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {fixture.status === 'completed' ? 'Tap for match summary' : 'Tap for match preview'}
        </div>
      </div>
    );
  }

  // Default landscape/desktop layout
  return (
    <div 
      className={cn(
        "relative p-3 sm:p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 cursor-pointer group",
        "hover:shadow-md border border-transparent hover:border-muted-foreground/20",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Date - Top Right */}
      {showDate && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-xs text-muted-foreground">
          {formatDateDisplay(fixture.match_date)}
        </div>
      )}
      
      {/* Summary Icon for completed matches */}
      {fixture.status === 'completed' && (
        <button
          onClick={handleSummaryClick}
          className="absolute top-2 right-14 sm:top-3 sm:right-20 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted/50"
          aria-label="View match summary"
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </button>
      )}
      
      {/* Main content - horizontal layout */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
        {/* Home team */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 justify-end">
          <div className="font-medium text-xs sm:text-sm truncate text-right">
            <span className="hidden sm:inline">{homeTeamNames.full}</span>
            <span className="inline sm:hidden">{homeTeamNames.mobile}</span>
          </div>
          <div className="flex-shrink-0">
            <TeamLogo team={fixture.home_team} size="small" />
          </div>
        </div>
        
        {/* Center - Score or Status */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 gap-1">
          <Badge 
            variant={getStatusBadgeVariant()}
            className={cn(
              "px-2 py-1 font-bold text-xs min-w-[50px] text-center",
              fixture.status === 'live' && "animate-pulse"
            )}
          >
            {fixture.status === 'completed' 
              ? `${fixture.home_score || 0} - ${fixture.away_score || 0}`
              : getStatusBadgeText()
            }
          </Badge>
          
          {fixture.status === 'scheduled' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTimeDisplay(fixture.match_time || '')}</span>
            </div>
          )}
        </div>
        
        {/* Away team */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 justify-start">
          <div className="flex-shrink-0">
            <TeamLogo team={fixture.away_team} size="small" />
          </div>
          <div className="font-medium text-xs sm:text-sm truncate">
            <span className="hidden sm:inline">{awayTeamNames.full}</span>
            <span className="inline sm:hidden">{awayTeamNames.mobile}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactFixtureCard;
