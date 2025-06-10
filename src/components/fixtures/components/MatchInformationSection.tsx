
import { RefereeTeamAssignment } from "@/services/fixtures/refereeAssignmentService";
import VenueCard from "./VenueCard";
import RefereeAssignmentCard from "./RefereeAssignmentCard";

interface MatchInformationSectionProps {
  venue?: string;
  refereeAssignment?: RefereeTeamAssignment;
}

const MatchInformationSection = ({ venue, refereeAssignment }: MatchInformationSectionProps) => {
  // Don't render the section if there's no information to display
  const hasVenue = venue && venue !== 'TBD';
  const hasRefereeAssignment = !!refereeAssignment;

  if (!hasVenue && !hasRefereeAssignment) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {hasVenue && <VenueCard venue={venue} />}
      {hasRefereeAssignment && <RefereeAssignmentCard refereeAssignment={refereeAssignment} />}
    </div>
  );
};

export default MatchInformationSection;
