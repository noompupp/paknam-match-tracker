
import { Users } from "lucide-react";
import { RefereeTeamAssignment, refereeAssignmentService } from "@/services/fixtures/refereeAssignmentService";

interface RefereeAssignmentCardProps {
  refereeAssignment: RefereeTeamAssignment;
}

const RefereeAssignmentCard = ({ refereeAssignment }: RefereeAssignmentCardProps) => {
  return (
    <div className="flex items-center gap-4 text-sm p-4 rounded-xl bg-gradient-to-r from-secondary/8 via-secondary/4 to-transparent border border-secondary/20 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30">
      <div className="flex-shrink-0 p-2 rounded-lg bg-secondary/10 border border-secondary/20">
        <Users className="h-5 w-5 text-secondary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
          Referee Teams
        </p>
        <p className="font-semibold text-foreground text-sm leading-relaxed">
          {refereeAssignmentService.formatRefereeAssignment(refereeAssignment)}
        </p>
      </div>
    </div>
  );
};

export default RefereeAssignmentCard;
