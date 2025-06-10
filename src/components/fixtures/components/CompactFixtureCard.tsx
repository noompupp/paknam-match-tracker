
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

  const getStatusInfo = () => {
    switch (fixture.status) {
      case 'completed':
        return {
          text: 'FT',
          variant: 'default' as const,
          showScore: true,
          bgColor: 'bg-emerald-500/10',
          textColor: 'text-emerald-600',
          borderColor: 'border-emerald-200'
        };
      case 'live':
        return {
          text: 'LIVE',
          variant: 'destructive' as const,
          showScore: true,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-600',
          borderColor: 'border-red-200'
        };
      case 'scheduled':
        return {
          text: formatTimeDisplay(fixture.match_time || ''),
          variant: 'outline' as const,
          showScore: false,
          bgColor: 'bg-blue-500/5',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          text: 'MATCH',
          variant: 'outline' as const,
          showScore: false,
          bgColor: 'bg-muted/20',
          textColor: 'text-muted-foreground',
          borderColor: 'border-muted'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (shouldUseMobilePortrait) {
    return (
      <div 
        className={cn(
          "relative rounded-xl transition-all duration-200 cursor-pointer group overflow-hidden",
          "border shadow-sm hover:shadow-md active:scale-[0.98]",
          statusInfo.bgColor,
          statusInfo.borderColor,
          className
        )}
        onClick={handleCardClick}
      >
        {/* Background gradient for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
        
        {/* Header with date and action button */}
        <div className="relative p-3 pb-2">
          <div className="flex items-center justify-between">
            {showDate && (
              <div className="text-xs text-muted-foreground font-medium">
                {formatDateDisplay(fixture.match_date)}
              </div>
            )}
            
            {fixture.status === 'completed' && (
              <button
                onClick={handleSummaryClick}
                className="opacity-60 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/50 active:scale-95"
                aria-label="View match summary"
              >
                <Eye className="h-3.5 w-3.5 text-current" />
              </button>
            )}
          </div>
        </div>

        {/* Main content - vertical stacked layout for mobile portrait */}
        <div className="relative px-3 pb-4">
          {/* Teams container */}
          <div className="space-y-3">
            {/* Home team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <TeamLogo team={fixture.home_team} size="small" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" title={homeTeamNames.full}>
                    {homeTeamNames.compact}
                  </div>
                  <div className="text-xs text-muted-foreground">Home</div>
                </div>
              </div>
              
              {statusInfo.showScore && (
                <div className="text-2xl font-bold tabular-nums text-foreground">
                  {fixture.home_score || 0}
                </div>
              )}
            </div>

            {/* Center divider with status */}
            <div className="flex items-center justify-center py-1">
              <Badge 
                variant={statusInfo.variant}
                className={cn(
                  "text-xs px-3 py-1 font-bold border-0",
                  statusInfo.textColor,
                  fixture.status === 'live' && "animate-pulse"
                )}
              >
                {statusInfo.text}
              </Badge>
            </div>

            {/* Away team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <TeamLogo team={fixture.away_team} size="small" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" title={awayTeamNames.full}>
                    {awayTeamNames.compact}
                  </div>
                  <div className="text-xs text-muted-foreground">Away</div>
                </div>
              </div>
              
              {statusInfo.showScore && (
                <div className="text-2xl font-bold tabular-nums text-foreground">
                  {fixture.away_score || 0}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle action hint */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  // Landscape/desktop layout - horizontal compact design
  return (
    <div 
      className={cn(
        "relative rounded-lg transition-all duration-200 cursor-pointer group",
        "border shadow-sm hover:shadow-md p-3 active:scale-[0.98]",
        statusInfo.bgColor,
        statusInfo.borderColor,
        className
      )}
      onClick={handleCardClick}
    >
      {/* Date - Top Right */}
      {showDate && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground font-medium">
          {formatDateDisplay(fixture.match_date)}
        </div>
      )}
      
      {/* Summary Icon for completed matches */}
      {fixture.status === 'completed' && (
        <button
          onClick={handleSummaryClick}
          className="absolute top-2 right-16 opacity-60 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/50"
          aria-label="View match summary"
        >
          <Eye className="h-3.5 w-3.5 text-current" />
        </button>
      )}
      
      {/* Main content - horizontal layout */}
      <div className="flex items-center justify-between gap-3 mt-2">
        {/* Home team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamLogo team={fixture.home_team} size="small" className="flex-shrink-0" />
          <div className="font-semibold text-sm truncate" title={homeTeamNames.full}>
            <span className="hidden sm:inline">{homeTeamNames.mobile}</span>
            <span className="inline sm:hidden">{homeTeamNames.compact}</span>
          </div>
        </div>
        
        {/* Center - Score or Status */}
        <div className="flex items-center justify-center flex-shrink-0">
          {statusInfo.showScore ? (
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold tabular-nums">
                {fixture.home_score || 0}
              </div>
              <Badge 
                variant={statusInfo.variant}
                className={cn(
                  "text-xs px-2 py-0.5 font-bold border-0",
                  statusInfo.textColor,
                  fixture.status === 'live' && "animate-pulse"
                )}
              >
                {statusInfo.text}
              </Badge>
              <div className="text-lg font-bold tabular-nums">
                {fixture.away_score || 0}
              </div>
            </div>
          ) : (
            <Badge 
              variant={statusInfo.variant}
              className={cn(
                "text-xs px-3 py-1 font-bold border-0",
                statusInfo.textColor
              )}
            >
              {statusInfo.text}
            </Badge>
          )}
        </div>
        
        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <div className="font-semibold text-sm truncate text-right" title={awayTeamNames.full}>
            <span className="hidden sm:inline">{awayTeamNames.mobile}</span>
            <span className="inline sm:hidden">{awayTeamNames.compact}</span>
          </div>
          <TeamLogo team={fixture.away_team} size="small" className="flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default CompactFixtureCard;
