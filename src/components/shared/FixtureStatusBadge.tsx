
import { Badge } from "@/components/ui/badge";

interface Props {
  status: string;
}

const FixtureStatusBadge = ({ status }: Props) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="text-xs px-2 py-1">
          Full Time
        </Badge>
      );
    case "live":
      return (
        <Badge
          variant="destructive"
          className="text-xs px-2 py-1 animate-pulse"
        >
          LIVE
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs px-2 py-1">
          Scheduled
        </Badge>
      );
  }
};

export default FixtureStatusBadge;
