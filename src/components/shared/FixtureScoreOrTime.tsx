
import { Clock } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatCombinedDateTime } from "@/utils/dateTimeUtils";

interface Props {
  fixture: Fixture;
}

const FixtureScoreOrTime = ({ fixture }: Props) => {
  if (fixture.status === "completed" || fixture.status === "live") {
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
      <span>
        {formatCombinedDateTime(fixture.match_date, fixture.match_time)}
      </span>
    </div>
  );
};

export default FixtureScoreOrTime;
