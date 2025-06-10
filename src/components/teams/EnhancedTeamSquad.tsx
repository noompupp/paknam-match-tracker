
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Trophy, Clock, Award, Zap } from "lucide-react";
import { useTeamPlayerStats } from "@/hooks/usePlayerStats";
import PlayerAvatar from "@/components/shared/PlayerAvatar";

interface EnhancedTeamSquadProps {
  teamId: string;
  teamName: string;
}

const EnhancedTeamSquad = ({ teamId, teamName }: EnhancedTeamSquadProps) => {
  const { data: players, isLoading, error } = useTeamPlayerStats(teamId);

  // Helper function to convert seconds to minutes
  const formatPlayingTime = (totalMinutesPlayed: number | null | undefined): string => {
    if (!totalMinutesPlayed || totalMinutesPlayed === 0) return '0';
    
    // If the value seems to be in seconds (very large number), convert to minutes
    if (totalMinutesPlayed > 1000) {
      return Math.round(totalMinutesPlayed / 60).toString();
    }
    
    // Otherwise assume it's already in minutes
    return Math.round(totalMinutesPlayed).toString();
  };

  if (error) {
    return (
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p className="font-medium">Error loading squad data</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Unable to fetch team squad'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premier-league-card border-l-4 border-l-primary">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="text-primary font-bold">{teamName}</span>
            <span className="ml-2 text-muted-foreground">Squad</span>
            {!isLoading && players && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({players.length} players)
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-14" />
                  <Skeleton className="h-7 w-14" />
                  <Skeleton className="h-7 w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : players && players.length > 0 ? (
          <div>
            {/* Players List */}
            <div className="divide-y">
              {players.map((player, index) => (
                <div key={player.id || index} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <PlayerAvatar 
                        player={{
                          ...player,
                          number: player.number || (index + 1)
                        }} 
                        size="large" 
                        showStats={true}
                      />
                      {/* Top performer indicators */}
                      {(player.goals || 0) >= 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Award className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {player.name || 'Unknown Player'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {player.position || 'Player'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-green-600" />
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
                        {player.goals || 0}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-blue-600" />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                        {player.assists || 0}
                      </Badge>
                    </div>

                    {((player.yellow_cards && player.yellow_cards > 0) || (player.red_cards && player.red_cards > 0)) && (
                      <div className="flex gap-1">
                        {player.yellow_cards && player.yellow_cards > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {player.yellow_cards}Y
                          </Badge>
                        )}
                        {player.red_cards && player.red_cards > 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {player.red_cards}R
                          </Badge>
                        )}
                      </div>
                    )}

                    {player.total_minutes_played && player.total_minutes_played > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {formatPlayingTime(player.total_minutes_played)}m
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Separator />
            
            {/* Team Statistics Summary */}
            <div className="p-6 bg-gradient-to-r from-muted/30 to-muted/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-bold text-lg text-foreground">Team Statistics</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold text-green-600">
                    {players.reduce((sum, player) => sum + (player.goals || 0), 0)}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Total Goals</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold text-blue-600">
                    {players.reduce((sum, player) => sum + (player.assists || 0), 0)}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Total Assists</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold text-yellow-600">
                    {players.reduce((sum, player) => sum + (player.yellow_cards || 0), 0)}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Yellow Cards</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-bold text-red-600">
                    {players.reduce((sum, player) => sum + (player.red_cards || 0), 0)}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Red Cards</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12 px-6">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium text-lg mb-2">No players found for this team</p>
            <p className="text-sm">Players will appear here once they're added to the squad</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTeamSquad;
