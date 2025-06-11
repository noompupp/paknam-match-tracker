
import { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useTeamMembers } from "@/hooks/useMembers";
import TeamsGrid from "./teams/TeamsGrid";
import EnhancedTeamSquad from "./teams/EnhancedTeamSquad";
import TournamentLogo from "./TournamentLogo";
import UnifiedContainer from "./shared/UnifiedContainer";
import StickyBackground from "./shared/StickyBackground";

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
      // Enhanced scroll calculation with safe area support
      const navHeight = 70;
      const safeAreaBottom = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-bottom').replace('px', '')) || 0;
      const totalOffset = navHeight + safeAreaBottom + 20;
      
      const elementPosition = squadSection.getBoundingClientRect().top + window.scrollY - totalOffset;
      
      window.scrollTo({ 
        top: Math.max(0, elementPosition), 
        behavior: 'smooth' 
      });
    }
  };

  if (error) {
    return (
      <UnifiedContainer variant="content" className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-foreground">
          <h2 className="text-2xl font-bold mb-4">Error Loading Teams</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
          <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
        </div>
      </UnifiedContainer>
    );
  }

  return (
    <>
      {/* Header */}
      <StickyBackground variant="header">
        <UnifiedContainer variant="content">
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TournamentLogo />
              <h1 className="text-3xl font-bold text-foreground">Teams & Players</h1>
            </div>
            <p className="text-muted-foreground">Meet our {teams?.length || 0} competing teams</p>
          </div>
        </UnifiedContainer>
      </StickyBackground>

      <UnifiedContainer variant="content" spacing="normal">
        {/* Teams Grid */}
        <TeamsGrid 
          teams={teams}
          isLoading={teamsLoading}
          onViewSquad={handleViewSquad}
        />

        {/* Enhanced Team Squad (showing selected team's squad with enhanced data) */}
        {selectedTeam && (
          <div id="team-squad" className="scroll-mt-nav">
            <EnhancedTeamSquad
              teamId={selectedTeam.__id__}
              teamName={selectedTeam.name || 'Unknown Team'}
            />
          </div>
        )}
      </UnifiedContainer>
    </>
  );
};

export default Teams;
