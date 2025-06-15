
import { useState, useEffect } from "react";
import { useTeams } from "@/hooks/useTeams";
import TeamsGrid from "./teams/TeamsGrid";
import EnhancedTeamSquad from "./teams/EnhancedTeamSquad";
import UnifiedPageHeader from "./shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const Teams = () => {
  const { t } = useTranslation();
  const { data: teams, isLoading: teamsLoading, error } = useTeams();
  const queryClient = useQueryClient();

  // Use __id__ (string doc ID from Firestore/Supabase) for routing/enhanced services
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // On mount, force cache invalidation for the 'teams' query to ensure latest data appears
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["teams"] });
  }, [queryClient]);
  
  // Find by __id__ not numeric id
  const selectedTeam = teams?.find(team => team.__id__ === selectedTeamId);

  // Always pass and store team.__id__ (doc key)
  const handleViewSquad = (teamId: string) => {
    setSelectedTeamId(teamId);
    const squadSection = document.getElementById('enhanced-team-squad');
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

  const handleBackToTeams = () => {
    setSelectedTeamId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="gradient-bg flex items-center justify-center min-h-screen">
        <div className="text-center text-foreground container-responsive">
          <h2 className="text-2xl font-bold mb-4">{t('common.error')} Loading Teams</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
          <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg">
      {/* Header */}
      <UnifiedPageHeader 
        title={selectedTeam ? `${selectedTeam.name} Squad` : t('nav.teams')}
        logoSize="small"
        showLanguageToggle={true}
      />

      <div className="max-w-7xl mx-auto container-responsive py-8 space-y-8 mobile-content-spacing">
        {selectedTeam && (
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToTeams}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Teams
            </Button>
          </div>
        )}

        {/* Teams Grid or Enhanced Squad */}
        {!selectedTeam ? (
          <TeamsGrid 
            teams={teams}
            isLoading={teamsLoading}
            onViewSquad={handleViewSquad}
          />
        ) : (
          <div id="enhanced-team-squad" className="scroll-mt-nav">
            <EnhancedTeamSquad
              teamId={selectedTeam.__id__}
              teamName={selectedTeam.name || 'Unknown Team'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;

