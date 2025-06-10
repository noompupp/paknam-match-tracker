
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
    <div className="space-y-8 pb-8 border-b border-border/50">
      {/* Enhanced Mobile-First Dual Banner Layout */}
      <div className="space-y-6">
        {/* Home Team Banner */}
        <TeamBanner 
          team={homeTeam} 
          variant="home"
          className="w-full transform transition-all duration-500 hover:scale-[1.02]"
        />

        {/* Enhanced Kickoff Section */}
        <KickoffSection 
          fixture={fixture}
          className="w-full transform transition-all duration-500 hover:scale-[1.01]"
        />

        {/* Away Team Banner */}
        <TeamBanner 
          team={awayTeam} 
          variant="away"
          className="w-full transform transition-all duration-500 hover:scale-[1.02]"
        />
      </div>

      {/* Enhanced Match Information Cards */}
      <MatchInformationSection 
        venue={venue}
        refereeAssignment={refereeAssignment}
      />
    </div>
  );
};

export default MatchPreviewHeader;
