
import { Users } from "lucide-react";
import { RefereeTeamAssignment } from "@/services/fixtures/refereeAssignmentService";

interface RefereeAssignmentCardProps {
  refereeAssignment: RefereeTeamAssignment;
}

const RefereeAssignmentCard = ({ refereeAssignment }: RefereeAssignmentCardProps) => {
  return (
    <div className="flex items-start gap-4 text-sm p-4 rounded-xl bg-gradient-to-r from-secondary/8 via-secondary/4 to-transparent border-2 border-secondary/20 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30">
      <div className="flex-shrink-0 p-2 rounded-lg bg-secondary/10 border border-secondary/20">
        <Users className="h-5 w-5 text-secondary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          Referee Teams
        </p>
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-sm leading-relaxed">
            Home: {refereeAssignment.homeTeamReferee}
          </p>
          <p className="font-semibold text-foreground text-sm leading-relaxed">
            Away: {refereeAssignment.awayTeamReferee}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefereeAssignmentCard;
