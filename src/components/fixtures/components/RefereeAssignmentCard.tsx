
import { Users } from "lucide-react";
import { RefereeTeamAssignment, refereeAssignmentService } from "@/services/fixtures/refereeAssignmentService";

interface RefereeAssignmentCardProps {
  refereeAssignment: RefereeTeamAssignment;
}

const RefereeAssignmentCard = ({ refereeAssignment }: RefereeAssignmentCardProps) => {
  return (
    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/50">
      <Users className="h-4 w-4 text-secondary flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground mb-1">Referee Teams</p>
        <p className="font-medium text-xs">
          {refereeAssignmentService.formatRefereeAssignment(refereeAssignment)}
        </p>
      </div>
    </div>
  );
};

export default RefereeAssignmentCard;
