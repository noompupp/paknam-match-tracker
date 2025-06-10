
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, Clock, MapPin } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import { getResponsiveTeamName } from "@/utils/teamNameUtils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import TeamLogo from "../teams/TeamLogo";
import { cn } from "@/lib/utils";

interface UnifiedFixtureCardProps {
  fixture: Fixture;
  onFixtureClick?: (fixture: Fixture) => void;
  onPreviewClick?: (fixture: Fixture) => void;
  showDate?: boolean;
  showVenue?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

const UnifiedFixtureCard = ({ 
  fixture, 
  onFixtureClick,
  onPreviewClick,
  showDate = true,
  showVenue = false,
  variant = 'default',
  className = ""
}: UnifiedFixtureCardProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  const homeTeamNames = getResponsiveTeamName(fixture.home_team?.name || 'TBD');
  const awayTeamNames = getResponsiveTeamName(fixture.away_team?.name || 'TBD');

  // Smart click behavior based on match status
  const handleCardClick = () => {
    if (fixture.status === 'completed' && onFixtureClick) {
      onFixtureClick(fixture);
    } else if (onPreviewClick) {
      onPreviewClick(fixture);
    }
  };

  const handleSummaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fixture.status === 'completed' && onFixtureClick) {
      onFixtureClick(fixture);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'live':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCenterContent = () => {
    if (fixture.status === 'completed' || fixture.status === 'live') {
      return `${fixture.home_score || 0} - ${fixture.away_score || 0}`;
    }
    return 'VS';
  };

  const getClickHintText = () => {
    if (fixture.status === 'completed') {
      return 'Tap for match summary';
    }
    return 'Tap for match preview';
  };

  // Mobile portrait optimized layout
  if (isMobilePortrait && variant !== 'minimal') {
    return (
      <Card 
        className={cn(
          "card-shadow-lg hover:card-shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group",
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          {/* Header with date and status */}
          <div className="flex justify-between items-center mb-3">
            {showDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDateDisplay(fixture.match_date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(fixture.status)} className="text-xs">
                {fixture.status === 'completed' ? 'FT' : fixture.status === 'live' ? 'LIVE' : 'SCH'}
              </Badge>
              {fixture.status === 'completed' && (
                <button
                  onClick={handleSummaryClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted/50"
                >
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Teams and score - mobile optimized */}
          <div className="space-y-3">
            {/* Home team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <TeamLogo team={fixture.home_team} size="small" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{homeTeamNames.mobile}</p>
                  <p className="text-xs text-muted-foreground">Home</p>
                </div>
              </div>
              {fixture.status === 'completed' || fixture.status === 'live' ? (
                <div className="text-xl font-bold">{fixture.home_score || 0}</div>
              ) : null}
            </div>

            {/* Score divider for live/completed matches */}
            {(fixture.status === 'completed' || fixture.status === 'live') && (
              <div className="flex justify-center">
                <div className="text-lg font-bold text-muted-foreground">-</div>
              </div>
            )}

            {/* Away team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <TeamLogo team={fixture.away_team} size="small" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{awayTeamNames.mobile}</p>
                  <p className="text-xs text-muted-foreground">Away</p>
                </div>
              </div>
              {fixture.status === 'completed' || fixture.status === 'live' ? (
                <div className="text-xl font-bold">{fixture.away_score || 0}</div>
              ) : null}
            </div>
          </div>

          {/* Time and venue info */}
          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
              <Clock className="h-3 w-3" />
              <span>{formatTimeDisplay(fixture.match_time)}</span>
            </div>
            
            {showVenue && fixture.venue && fixture.venue !== 'TBD' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{fixture.venue}</span>
              </div>
            )}
            
            <div className="text-center">
              <span className="text-xs text-muted-foreground/70">{getClickHintText()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default/desktop layout with responsive team names
  return (
    <Card 
      className={cn(
        "card-shadow-lg hover:card-shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group",
        variant === 'compact' && "p-3",
        variant === 'minimal' && "p-2 bg-muted/20 border-0",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className={cn("p-6", variant === 'compact' && "p-4", variant === 'minimal' && "p-3")}>
        {/* Header section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {showDate && (
              <>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDateDisplay(fixture.match_date)}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(fixture.status)}>
              {fixture.status === 'completed' ? 'Full Time' : 
               fixture.status === 'live' ? 'LIVE' : 'Scheduled'}
            </Badge>
            
            {fixture.status === 'completed' && (
              <button
                onClick={handleSummaryClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted/50"
              >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Teams and score section */}
        <div className="flex items-center justify-between">
          {/* Home team */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <TeamLogo team={fixture.home_team} size="small" />
            <div className="min-w-0">
              <p className="font-semibold truncate">
                <span className="hidden sm:inline">{homeTeamNames.full}</span>
                <span className="inline sm:hidden">{homeTeamNames.mobile}</span>
              </p>
              <p className="text-xs text-muted-foreground">Home</p>
            </div>
          </div>

          {/* Center - score or time */}
          <div className="flex items-center gap-4 mx-4">
            {fixture.status === 'completed' || fixture.status === 'live' ? (
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {fixture.home_score || 0} - {fixture.away_score || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {fixture.status === 'completed' ? 'Final' : 'Live'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" />
                  {formatTimeDisplay(fixture.match_time)}
                </div>
                <p className="text-xs text-muted-foreground">Kick off</p>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <div className="text-right min-w-0">
              <p className="font-semibold truncate">
                <span className="hidden sm:inline">{awayTeamNames.full}</span>
                <span className="inline sm:hidden">{awayTeamNames.mobile}</span>
              </p>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
            <TeamLogo team={fixture.away_team} size="small" />
          </div>
        </div>

        {/* Venue and click hints */}
        {(showVenue || variant !== 'minimal') && (
          <div className="mt-4 space-y-2">
            {showVenue && fixture.venue && fixture.venue !== 'TBD' && (
              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{fixture.venue}</span>
              </div>
            )}
            
            {variant !== 'minimal' && (
              <div className="flex justify-center text-xs text-muted-foreground">
                <span>{getClickHintText()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedFixtureCard;
