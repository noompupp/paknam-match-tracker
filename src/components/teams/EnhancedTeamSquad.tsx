
import { Card, CardContent } from "@/components/ui/card";
import { useEnhancedTeamStats, useTeamOverview } from "@/hooks/useEnhancedTeamStats";
import TeamSquadHeader from "./components/TeamSquadHeader";
import EnhancedTeamStatsOverview from "./components/EnhancedTeamStatsOverview";
import EnhancedPlayersList from "./components/EnhancedPlayersList";
import { AlertTriangle } from "lucide-react";

interface EnhancedTeamSquadProps {
  teamId: string;
  teamName: string;
}

const EnhancedTeamSquad = ({ teamId, teamName }: EnhancedTeamSquadProps) => {
  const { data: players, isLoading: playersLoading, error: playersError } = useEnhancedTeamStats(teamId);
  const { data: overview, isLoading: overviewLoading } = useTeamOverview(teamId);

  console.log('👥 EnhancedTeamSquad: Rendering with enhanced data:', {
    teamId,
    teamName,
    playersCount: players?.length,
    hasOverview: !!overview
  });

  if (playersError) {
    return (
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <p className="font-medium">Error loading enhanced squad data</p>
            <p className="text-sm text-muted-foreground mt-1">
              {playersError instanceof Error ? playersError.message : 'Unable to fetch enhanced team data'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premier-league-card border-l-4 border-l-primary">
      <TeamSquadHeader 
        teamName={teamName} 
        playerCount={!playersLoading && players ? players.length : 0} 
      />
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Enhanced Team Overview */}
          {!overviewLoading && overview && (
            <EnhancedTeamStatsOverview overview={overview} />
          )}

          {/* Enhanced Players List with Filtering and Sorting */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Squad Players
              {players && (
                <span className="text-sm text-muted-foreground font-normal">
                  ({players.length} players)
                </span>
              )}
            </h3>

            <EnhancedPlayersList
              players={players}
              isLoading={playersLoading}
              showDetailedStats={true}
              variant="default"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTeamSquad;
