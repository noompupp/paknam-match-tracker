
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import { generateTeamAbbreviation } from "@/utils/teamAbbreviations";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import TeamLogo from "../teams/TeamLogo";
import { cn } from "@/lib/utils";

interface CompactFixtureCardProps {
  fixture: Fixture;
  onFixtureClick?: (fixture: Fixture) => void;
  onPreviewClick?: (fixture: Fixture) => void;
  showDate?: boolean;
  showVenue?: boolean;
  className?: string;
}

const CompactFixtureCard = ({ 
  fixture, 
  onFixtureClick,
  onPreviewClick,
  showDate = true,
  showVenue = false,
  className = ""
}: CompactFixtureCardProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  const homeTeamAbbr = generateTeamAbbreviation(fixture.home_team?.name || 'TBD');
  const awayTeamAbbr = generateTeamAbbreviation(fixture.away_team?.name || 'TBD');

  const handleCardClick = () => {
    if (fixture.status === 'completed' && onFixtureClick) {
      onFixtureClick(fixture);
    } else if (onPreviewClick) {
      onPreviewClick(fixture);
    }
  };

  const getStatusBadge = () => {
    switch (fixture.status) {
      case 'completed':
        return <Badge variant="default" className="text-xs px-2 py-1">FT</Badge>;
      case 'live':
        return <Badge variant="destructive" className="text-xs px-2 py-1 animate-pulse">LIVE</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-2 py-1">SCH</Badge>;
    }
  };

  const getActionText = () => {
    if (fixture.status === 'completed') {
      return 'Tap for Match Summary';
    }
    return 'Tap for Match Preview';
  };

  const getScoreOrTime = () => {
    if (fixture.status === 'completed' || fixture.status === 'live') {
      return (
        <div className="flex items-center gap-1 text-lg font-bold">
          <span>{fixture.home_score || 0}</span>
          <span className="text-muted-foreground">-</span>
          <span>{fixture.away_score || 0}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{formatTimeDisplay(fixture.match_time)}</span>
      </div>
    );
  };

  // Use compact layout for mobile portrait
  if (isMobilePortrait) {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20",
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-3">
          {/* Header with date and status */}
          <div className="flex justify-between items-center mb-3">
            {showDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDateDisplay(fixture.match_date)}</span>
              </div>
            )}
            {getStatusBadge()}
          </div>

          {/* Teams row 1: Home team */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-6 h-6 flex-shrink-0">
                  <TeamLogo team={fixture.home_team} size="small" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{homeTeamAbbr}</span>
                    <span className="text-xs text-muted-foreground">HOME</span>
                  </div>
                </div>
              </div>
              {fixture.status === 'completed' || fixture.status === 'live' ? (
                <div className="text-lg font-bold">{fixture.home_score || 0}</div>
              ) : null}
            </div>

            {/* Teams row 2: Away team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-6 h-6 flex-shrink-0">
                  <TeamLogo team={fixture.away_team} size="small" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{awayTeamAbbr}</span>
                    <span className="text-xs text-muted-foreground">AWAY</span>
                  </div>
                </div>
              </div>
              {fixture.status === 'completed' || fixture.status === 'live' ? (
                <div className="text-lg font-bold">{fixture.away_score || 0}</div>
              ) : null}
            </div>
          </div>

          {/* Time/Score center for non-completed matches */}
          {fixture.status !== 'completed' && fixture.status !== 'live' && (
            <div className="flex justify-center mt-2 pt-2 border-t">
              {getScoreOrTime()}
            </div>
          )}

          {/* Footer with venue and action text */}
          <div className="mt-3 pt-2 border-t space-y-1">
            {showVenue && fixture.venue && fixture.venue !== 'TBD' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{fixture.venue}</span>
              </div>
            )}
            <div className="text-center">
              <span className="text-xs text-muted-foreground/70">{getActionText()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default layout for larger screens
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          {showDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDateDisplay(fixture.match_date)}</span>
            </div>
          )}
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between">
          {/* Home team */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <TeamLogo team={fixture.home_team} size="small" />
            <div>
              <p className="font-semibold text-sm">{homeTeamAbbr}</p>
              <p className="text-xs text-muted-foreground">Home</p>
            </div>
          </div>

          {/* Center - score or time */}
          <div className="mx-4">
            {getScoreOrTime()}
          </div>

          {/* Away team */}
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <div className="text-right">
              <p className="font-semibold text-sm">{awayTeamAbbr}</p>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
            <TeamLogo team={fixture.away_team} size="small" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t space-y-1">
          {showVenue && fixture.venue && fixture.venue !== 'TBD' && (
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{fixture.venue}</span>
            </div>
          )}
          <div className="flex justify-center text-xs text-muted-foreground">
            <span>{getActionText()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactFixtureCard;
