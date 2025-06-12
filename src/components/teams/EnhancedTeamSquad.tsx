
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnhancedTeamStats, useTeamOverview } from "@/hooks/useEnhancedTeamStats";
import TeamSquadHeader from "./components/TeamSquadHeader";
import EnhancedTeamStatsOverview from "./components/EnhancedTeamStatsOverview";
import EnhancedPlayerCard from "./components/EnhancedPlayerCard";
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
          {overviewLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ) : overview ? (
            <EnhancedTeamStatsOverview overview={overview} />
          ) : null}

          {/* Enhanced Players List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Squad Players
              {players && (
                <span className="text-sm text-muted-foreground font-normal">
                  ({players.length} players)
                </span>
              )}
            </h3>

            {playersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : players && players.length > 0 ? (
              <div className="space-y-4">
                {players.map((player) => (
                  <EnhancedPlayerCard
                    key={player.id}
                    player={player}
                    showDetailedStats={true}
                    variant="default"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium text-lg mb-2 text-muted-foreground">No players found for this team</p>
                <p className="text-sm text-muted-foreground">Enhanced player data will appear here once available</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTeamSquad;
