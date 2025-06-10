
import { Fixture, Team } from "@/types/database";
import { RefereeTeamAssignment } from "@/services/fixtures/refereeAssignmentService";
import TeamBanner from "./TeamBanner";
import KickoffSection from "./KickoffSection";
import MatchInformationSection from "./MatchInformationSection";

interface MatchPreviewHeaderProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  refereeAssignment?: RefereeTeamAssignment;
  venue?: string;
}

const MatchPreviewHeader = ({ 
  fixture, 
  homeTeam, 
  awayTeam, 
  refereeAssignment,
  venue 
}: MatchPreviewHeaderProps) => {
  return (
    <div className="space-y-6 pb-6 border-b border-border/50">
      {/* Mobile-First Dual Banner Layout */}
      <div className="space-y-4">
        {/* Home Team Banner */}
        <TeamBanner 
          team={homeTeam} 
          variant="home"
          className="w-full"
        />

        {/* Kickoff Section */}
        <KickoffSection 
          fixture={fixture}
          className="w-full"
        />

        {/* Away Team Banner */}
        <TeamBanner 
          team={awayTeam} 
          variant="away"
          className="w-full"
        />
      </div>

      {/* Match Information Cards */}
      <MatchInformationSection 
        venue={venue}
        refereeAssignment={refereeAssignment}
      />
    </div>
  );
};

export default MatchPreviewHeader;
