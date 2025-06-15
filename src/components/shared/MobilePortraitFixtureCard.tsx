
import { Card, CardContent } from "@/components/ui/card";
import TeamLogo from "../teams/TeamLogo";
import FixtureStatusBadge from "./FixtureStatusBadge";
import { formatCombinedDateTime } from "@/utils/dateTimeUtils";
import { Fixture } from "@/types/database";
import { cn } from "@/lib/utils";

interface Props {
  fixture: Fixture;
  onFixtureClick?: (fixture: Fixture) => void;
  onPreviewClick?: (fixture: Fixture) => void;
  className?: string;
}

const MobilePortraitFixtureCard = ({
  fixture,
  onFixtureClick,
  onPreviewClick,
  className = "",
}: Props) => {
  const handleCardClick = () => {
    if (fixture.status === "completed" && onFixtureClick) {
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

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        {/* Header with kickoff date + time (left) and status (right) */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>
              {formatCombinedDateTime(fixture.match_date, fixture.match_time)}
            </span>
          </div>
          <FixtureStatusBadge status={fixture.status} />
        </div>

        {/* Teams displayed vertically */}
        <div className="space-y-2">
          {/* Home team (top) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-6 h-6 flex-shrink-0">
                <TeamLogo team={fixture.home_team} size="small" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm truncate">
                  {fixture.home_team?.name || "TBD"}
                </span>
              </div>
            </div>
            {(fixture.status === "completed" || fixture.status === "live") && (
              <div className="text-lg font-bold">
                {fixture.home_score || 0}
              </div>
            )}
          </div>

          {/* Away team (bottom) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-6 h-6 flex-shrink-0">
                <TeamLogo team={fixture.away_team} size="small" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm truncate">
                  {fixture.away_team?.name || "TBD"}
                </span>
              </div>
            </div>
            {(fixture.status === "completed" || fixture.status === "live") && (
              <div className="text-lg font-bold">
                {fixture.away_score || 0}
              </div>
            )}
          </div>
        </div>

        {/* Footer with action text only */}
        <div className="mt-3 pt-2 border-t">
          <div className="text-center">
            <span className="text-xs text-muted-foreground/70">
              {getActionText()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobilePortraitFixtureCard;
