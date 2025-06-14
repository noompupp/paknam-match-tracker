import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import TeamLogo from "../teams/TeamLogo";
import { getNeutralScoreStyle } from "@/utils/scoreColorUtils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface MobilePortraitFixtureCardProps {
  fixture: Fixture;
  onClick?: (fixture: Fixture) => void;
  showDate?: boolean;
  className?: string;
}

const MobilePortraitFixtureCard = ({
  fixture,
  onClick,
  showDate = true,
  className = "",
}: MobilePortraitFixtureCardProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  const handleClick = () => {
    if (onClick && fixture.status === "completed") {
      onClick(fixture);
    }
  };

  // Format date and time consistently with Upcoming Fixtures
  const formatDateTimeDisplay = (dateString: string, timeString: string) => {
    const dateFormatted = formatDateDisplay(dateString);
    const timeFormatted = formatTimeDisplay(timeString);
    return `${dateFormatted} • ${timeFormatted}`;
  };

  // Enhanced horizontal flex for completed mobile portrait
  const useHorizontalLayout =
    isMobilePortrait && fixture.status === "completed";

  return (
    <div
      className={`relative p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 ${
        fixture.status === "completed"
          ? "cursor-pointer group hover:shadow-md border border-transparent hover:border-muted-foreground/20"
          : ""
      } ${className}`}
      onClick={handleClick}
    >
      {/* Match date and time - top right */}
      {showDate && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground max-w-[140px] text-right leading-tight">
          {formatDateTimeDisplay(fixture.match_date, fixture.match_time || "")}
        </div>
      )}

      {/* Eye icon - top right, appears on hover for completed matches */}
      {fixture.status === "completed" && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Eye className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {/* Horizontal Flex Layout for Mobile Portrait & Completed Fixtures */}
      {useHorizontalLayout ? (
        <div className="flex items-center justify-between px-2 min-h-[74px]">
          {/* Left: Team Logos and Names in column */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Logos */}
            <div className="flex flex-col items-center gap-1">
              <TeamLogo team={fixture.home_team} size="small" />
              <TeamLogo team={fixture.away_team} size="small" />
            </div>
            {/* Names */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="text-xs font-medium text-muted-foreground leading-tight max-w-[80px] truncate">
                {fixture.home_team?.name || "TBD"}
              </div>
              <div className="text-xs font-medium text-muted-foreground leading-tight max-w-[80px] truncate">
                {fixture.away_team?.name || "TBD"}
              </div>
            </div>
          </div>
          {/* Right: Status and Score, vertically stacked and centered */}
          <div className="flex flex-col items-center justify-center min-w-[88px] pl-3 pr-2">
            <Badge
              variant="default"
              className="text-xs px-2 py-1 font-bold mb-1 w-[72px] text-center"
              style={{ borderRadius: 16 }}
            >
              FT
            </Badge>
            <div
              className="text-xl font-bold mt-1 w-[72px] text-center"
              style={getNeutralScoreStyle(true)}
            >
              {fixture.home_score || 0} - {fixture.away_score || 0}
            </div>
          </div>
        </div>
      ) : (
        // Original Grid Layout for all other cases
        <div className="grid grid-cols-3 gap-3 items-center min-h-[120px] mt-6">
          {/* Column 1: Home Team */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <TeamLogo team={fixture.home_team} size="small" />
            <div className="text-center w-full">
              <div className="text-xs font-medium text-muted-foreground mb-1 leading-tight max-w-[80px] mx-auto">
                <span
                  className="block truncate"
                  title={fixture.home_team?.name || "TBD"}
                >
                  {fixture.home_team?.name || "TBD"}
                </span>
              </div>
              <div
                className="text-2xl font-bold leading-none mobile-score-enhanced"
                style={getNeutralScoreStyle(true)}
              >
                {fixture.home_score || 0}
              </div>
            </div>
          </div>

          {/* Column 2: Match Info */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <Badge
              variant={
                fixture.status === "completed" ? "default" : "outline"
              }
              className="text-xs px-2 py-1 font-bold"
            >
              {fixture.status === "completed"
                ? "FT"
                : fixture.status?.toUpperCase() || "MATCH"}
            </Badge>

            <div className="text-lg font-light text-muted-foreground">VS</div>

            {/* Match result indicator */}
            {fixture.status === "completed" && (
              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
            )}
          </div>

          {/* Column 3: Away Team */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <TeamLogo team={fixture.away_team} size="small" />
            <div className="text-center w-full">
              <div className="text-xs font-medium text-muted-foreground mb-1 leading-tight max-w-[80px] mx-auto">
                <span
                  className="block truncate"
                  title={fixture.away_team?.name || "TBD"}
                >
                  {fixture.away_team?.name || "TBD"}
                </span>
              </div>
              <div
                className="text-2xl font-bold leading-none mobile-score-enhanced"
                style={getNeutralScoreStyle(true)}
              >
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click hint for completed matches */}
      {fixture.status === "completed" && (
        <div className="text-center text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Tap to view match summary
        </div>
      )}
    </div>
  );
};

export default MobilePortraitFixtureCard;
