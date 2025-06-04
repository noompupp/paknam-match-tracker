
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Trophy, Calendar, Clock } from "lucide-react";
import TeamLogo from "./TeamLogo";
import { Team } from "@/types/database";
import { useTeamPlayerStats } from "@/hooks/usePlayerStats";

interface TeamSquadProps {
  team: Team;
  members: any[] | undefined;
  isLoading: boolean;
}

const TeamSquad = ({ team, members, isLoading }: TeamSquadProps) => {
  // Use enhanced player stats instead of the passed members
  const { data: enhancedPlayers, isLoading: enhancedLoading } = useTeamPlayerStats(team.__id__);
  
  // Use enhanced data if available, fallback to passed members
  const playersData = enhancedPlayers || members || [];
  const actualLoading = enhancedLoading || isLoading;

  const totalGoals = playersData?.reduce((sum, player) => sum + (player.goals || 0), 0) || 0;
  const totalAssists = playersData?.reduce((sum, player) => sum + (player.assists || 0), 0) || 0;
  const topScorer = playersData?.reduce((prev, current) => 
    (current.goals || 0) > (prev?.goals || 0) ? current : prev, playersData[0]
  );

  // Hierarchical sorting function
  const sortMembersHierarchically = (membersList: any[]) => {
    const getRoleOrder = (role: string | null | undefined) => {
      switch (role?.toLowerCase()) {
        case 'captain': return 1;
        case 's-class': return 2;
        case 'starter': return 3;
        default: return 4;
      }
    };

    return membersList.sort((a, b) => {
      // First sort by role hierarchy
      const roleComparison = getRoleOrder(a.role) - getRoleOrder(b.role);
      if (roleComparison !== 0) return roleComparison;
      
      // Then by goals (descending)
      const goalsComparison = (b.goals || 0) - (a.goals || 0);
      if (goalsComparison !== 0) return goalsComparison;
      
      // Finally by name (ascending)
      return (a.name || '').localeCompare(b.name || '');
    });
  };

  return (
    <Card id="team-squad" className="card-shadow-lg animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo team={team} size="small" />
            <div>
              <CardTitle className="text-2xl font-bold">{team.name} Squad</CardTitle>
              <p className="text-muted-foreground">Current season players & statistics</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {playersData?.length || 0} Players
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Team Statistics Overview */}
          {!actualLoading && playersData && playersData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">Total Goals</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{totalGoals}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">Total Assists</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{totalAssists}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold">Top Scorer</span>
                </div>
                <p className="text-sm font-bold text-yellow-600">
                  {topScorer?.name || 'N/A'} ({topScorer?.goals || 0}G)
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Players List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Squad Members
            </h3>
            
            {actualLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))
            ) : playersData && playersData.length > 0 ? (
              sortMembersHierarchically([...playersData]).map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-muted">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg border-2 border-primary/20">
                      {player.number || index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg">{player.name}</p>
                        {player.role === "Captain" && (
                          <Badge variant="default" className="text-xs bg-yellow-600">
                            Captain
                          </Badge>
                        )}
                        {player.role === "S-class" && (
                          <Badge variant="default" className="text-xs bg-purple-600">
                            S-class
                          </Badge>
                        )}
                        {player.role === "Starter" && (
                          <Badge variant="outline" className="text-xs">
                            Starter
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium">{player.position}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-5 gap-3 mb-1">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{player.goals || 0}</p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{player.assists || 0}</p>
                        <p className="text-xs text-muted-foreground">Assists</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-yellow-600">{player.yellow_cards || 0}</p>
                        <p className="text-xs text-muted-foreground">Yellow</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{player.red_cards || 0}</p>
                        <p className="text-xs text-muted-foreground">Red</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{Math.round(player.total_minutes_played || 0)}</p>
                        <p className="text-xs text-muted-foreground">Minutes</p>
                      </div>
                    </div>
                    {((player.goals || 0) > 0 || (player.assists || 0) > 0) && (
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>This season</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No players found for this team</p>
                <p className="text-sm">Players will appear here once they are added to the database.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSquad;
