
import { Team, Member } from "@/types/database";
import SquadOverviewStats from "./SquadOverviewStats";
import TeamSquadSection from "./TeamSquadSection";

interface MatchPreviewSquadsProps {
  homeTeam: Team;
  awayTeam: Team;
  homeSquad: Member[];
  awaySquad: Member[];
}

const MatchPreviewSquads = ({ homeTeam, awayTeam, homeSquad, awaySquad }: MatchPreviewSquadsProps) => {
  return (
    <div className="space-y-6 w-full">
      {/* Squad Overview Stats */}
      <SquadOverviewStats 
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeSquad={homeSquad}
        awaySquad={awaySquad}
      />

      {/* Team Squads */}
      <div className="space-y-6 w-full">
        <TeamSquadSection 
          team={homeTeam} 
          squad={homeSquad} 
          variant="primary"
        />
        
        <TeamSquadSection 
          team={awayTeam} 
          squad={awaySquad} 
          variant="secondary"
        />
      </div>
    </div>
  );
};

export default MatchPreviewSquads;
