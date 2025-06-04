
import { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useTeamMembers } from "@/hooks/useMembers";
import TeamsGrid from "./teams/TeamsGrid";
import TeamSquad from "./teams/TeamSquad";
import TournamentLogo from "./TournamentLogo";

const Teams = () => {
  const { data: teams, isLoading: teamsLoading, error } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  // Get members for the selected team (or first team if none selected)
  const targetTeamId = selectedTeamId || teams?.[0]?.id || 0;
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers(targetTeamId);
  const selectedTeam = teams?.find(team => team.id === targetTeamId);

  const handleViewSquad = (teamId: number) => {
    setSelectedTeamId(teamId);
    const squadSection = document.getElementById('team-squad');
    if (squadSection) {
      squadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center pb-20">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error Loading Teams</h2>
          <p className="text-white/80">Please check your connection and try again.</p>
          <p className="text-white/60 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TournamentLogo />
              <h1 className="text-3xl font-bold text-white">Teams & Players</h1>
            </div>
            <p className="text-white/80">Meet our {teams?.length || 0} competing teams</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Teams Grid */}
        <TeamsGrid 
          teams={teams}
          isLoading={teamsLoading}
          onViewSquad={handleViewSquad}
        />

        {/* Team Squad (showing selected team's squad with enhanced data) */}
        {selectedTeam && (
          <TeamSquad
            team={selectedTeam}
            members={teamMembers}
            isLoading={membersLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Teams;
