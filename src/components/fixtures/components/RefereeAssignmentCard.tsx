
import { Users } from "lucide-react";
import { RefereeTeamAssignment } from "@/services/fixtures/refereeAssignmentService";
import BaseInfoCard from "./BaseInfoCard";

interface RefereeAssignmentCardProps {
  refereeAssignment: RefereeTeamAssignment;
}

const RefereeAssignmentCard = ({ refereeAssignment }: RefereeAssignmentCardProps) => {
  return (
    <BaseInfoCard
      title="Referee Teams"
      icon={<Users className="h-5 w-5" />}
      variant="secondary"
    >
      <div className="space-y-1">
        <p className="font-semibold text-base leading-relaxed truncate">
          Home: {refereeAssignment.homeTeamReferee}
        </p>
        <p className="font-semibold text-base leading-relaxed truncate">
          Away: {refereeAssignment.awayTeamReferee}
        </p>
      </div>
    </BaseInfoCard>
  );
};

export default RefereeAssignmentCard;
