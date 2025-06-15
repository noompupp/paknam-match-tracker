
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatCombinedDateTime } from "@/utils/dateTimeUtils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import TeamLogo from "../teams/TeamLogo";
import { cn } from "@/lib/utils";
import MobilePortraitFixtureCard from "./MobilePortraitFixtureCard";
import FixtureScoreOrTime from "./FixtureScoreOrTime";
import FixtureStatusBadge from "./FixtureStatusBadge";

interface CompactFixtureCardProps {
  fixture: Fixture;
  onClick?: (fixture: Fixture) => void;
  onFixtureClick?: (fixture: Fixture) => void;
  onPreviewClick?: (fixture: Fixture) => void;
  showDate?: boolean;
  showVenue?: boolean;
  showStatus?: boolean;
  className?: string;
}

const CompactFixtureCard = ({
  fixture,
  onClick,
  onFixtureClick,
  onPreviewClick,
  showDate = true,
  showVenue = false,
  showStatus = true,
  className = "",
}: CompactFixtureCardProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  const handleCardClick = () => {
    if (onClick) {
      onClick(fixture);
    } else if (fixture.status === "completed" && onFixtureClick) {
      onFixtureClick(fixture);
    } else if (onPreviewClick) {
      onPreviewClick(fixture);
    }
  };

  const getActionText = () => {
    if (fixture.status === "completed") {
      return "Tap for Match Summary";
    }
    return "Tap for Match Preview";
  };

  // Mobile Portrait layout
  if (isMobilePortrait) {
    return (
      <MobilePortraitFixtureCard
        fixture={fixture}
        onFixtureClick={onFixtureClick}
        onPreviewClick={onPreviewClick}
        className={className}
      />
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
              <span>
                {formatCombinedDateTime(fixture.match_date, fixture.match_time)}
              </span>
            </div>
          )}
          {showStatus && <FixtureStatusBadge status={fixture.status} />}
        </div>

        <div className="flex items-center justify-between">
          {/* Home team */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <TeamLogo team={fixture.home_team} size="small" />
            <div>
              <p className="font-semibold text-sm">
                {fixture.home_team?.name || "TBD"}
              </p>
            </div>
          </div>

          {/* Center - score or time */}
          <div className="mx-4">
            <FixtureScoreOrTime fixture={fixture} />
          </div>

          {/* Away team */}
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <div className="text-right">
              <p className="font-semibold text-sm">
                {fixture.away_team?.name || "TBD"}
              </p>
            </div>
            <TeamLogo team={fixture.away_team} size="small" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t space-y-1">
          {showVenue && fixture.venue && fixture.venue !== "TBD" && (
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
