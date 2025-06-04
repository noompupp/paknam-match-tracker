
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Target, Trophy, Clock } from "lucide-react";
import { useTeamPlayerStats } from "@/hooks/usePlayerStats";

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
      <Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {teamName} Squad {!isLoading && players && `(${players.length} players)`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : players && players.length > 0 ? (
          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={player.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {player.number || (index + 1)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{player.name || 'Unknown Player'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {player.position || 'Player'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {player.goals || 0}G
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {player.assists || 0}A
                    </Badge>
                  </div>

                  {((player.yellow_cards && player.yellow_cards > 0) || (player.red_cards && player.red_cards > 0)) && (
                    <div className="flex gap-1">
                      {player.yellow_cards && player.yellow_cards > 0 && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          {player.yellow_cards}Y
                        </Badge>
                      )}
                      {player.red_cards && player.red_cards > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {player.red_cards}R
                        </Badge>
                      )}
                    </div>
                  )}

                  {player.total_minutes_played && player.total_minutes_played > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        {formatPlayingTime(player.total_minutes_played)}m
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Team Statistics Summary */}
            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <h4 className="font-semibold mb-3">Team Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {players.reduce((sum, player) => sum + (player.goals || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Goals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {players.reduce((sum, player) => sum + (player.assists || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Assists</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {players.reduce((sum, player) => sum + (player.yellow_cards || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Yellow Cards</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {players.reduce((sum, player) => sum + (player.red_cards || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Red Cards</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No players found for this team</p>
            <p className="text-sm mt-2">Players will appear here once they're added to the squad</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTeamSquad;
