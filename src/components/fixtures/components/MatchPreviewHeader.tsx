
import { Fixture, Team } from "@/types/database";
import { RefereeTeamAssignment } from "@/services/fixtures/refereeAssignmentService";
import TeamBanner from "./TeamBanner";
import CompactKickoffDivider from "./CompactKickoffDivider";
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
    <div className="space-y-4 pb-6 border-b border-border/50">
      {/* Home Team Banner */}
      <TeamBanner 
        team={homeTeam} 
        variant="home"
        className="w-full transform transition-all duration-500 hover:scale-[1.01]"
      />

      {/* Away Team Banner - Reversed Layout */}
      <TeamBanner 
        team={awayTeam} 
        variant="away"
        className="w-full transform transition-all duration-500 hover:scale-[1.01] flex-row-reverse"
      />

      {/* Compact Kickoff Divider - moved after team banners */}
      <CompactKickoffDivider 
        fixture={fixture}
        className="w-full"
      />

      {/* Enhanced Match Information Cards */}
      <MatchInformationSection 
        venue={venue}
        refereeAssignment={refereeAssignment}
      />
    </div>
  );
};

export default MatchPreviewHeader;
