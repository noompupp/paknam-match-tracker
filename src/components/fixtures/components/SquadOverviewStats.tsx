
import { Team, Member } from "@/types/database";
import UnifiedOverviewCard from "./UnifiedOverviewCard";

interface SquadOverviewStatsProps {
  homeTeam: Team;
  awayTeam: Team;
  homeSquad: Member[];
  awaySquad: Member[];
}

const SquadOverviewStats = ({ homeTeam, awayTeam, homeSquad, awaySquad }: SquadOverviewStatsProps) => {
  const homeStats = [
    { value: homeSquad.length, label: "Players" },
    { value: homeSquad.reduce((sum, p) => sum + (p.goals || 0), 0), label: "Goals", color: "text-green-600" },
    { value: homeSquad.reduce((sum, p) => sum + (p.assists || 0), 0), label: "Assists", color: "text-blue-600" }
  ];

  const awayStats = [
    { value: awaySquad.length, label: "Players" },
    { value: awaySquad.reduce((sum, p) => sum + (p.goals || 0), 0), label: "Goals", color: "text-green-600" },
    { value: awaySquad.reduce((sum, p) => sum + (p.assists || 0), 0), label: "Assists", color: "text-blue-600" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 w-full">
      <UnifiedOverviewCard
        title={`${homeTeam.name} Overview`}
        teamName={homeTeam.name}
        variant="primary"
        stats={homeStats}
      />
      
      <UnifiedOverviewCard
        title={`${awayTeam.name} Overview`}
        teamName={awayTeam.name}
        variant="secondary"
        stats={awayStats}
      />
    </div>
  );
};

export default SquadOverviewStats;
