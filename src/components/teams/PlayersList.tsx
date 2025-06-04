
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Target, Users, Clock, AlertTriangle } from "lucide-react";

interface PlayersListProps {
  players: any[] | undefined;
  isLoading: boolean;
}

const PlayersList = ({ players, isLoading }: PlayersListProps) => {
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Players
        </h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Players
        </h3>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No players found for this team</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <User className="h-5 w-5" />
        Players ({players.length})
      </h3>
      
      <div className="space-y-2">
        {players.map((player, index) => (
          <div key={player.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-500">{player.position || 'Player'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Goals */}
              {(player.goals || 0) > 0 && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {player.goals}
                </Badge>
              )}
              
              {/* Assists */}
              {(player.assists || 0) > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {player.assists}
                </Badge>
              )}

              {/* Minutes Played */}
              {(player.totalMinutesPlayed || 0) > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatMinutes(player.totalMinutesPlayed)}
                </Badge>
              )}

              {/* Show badge if player has no stats */}
              {!(player.goals || 0) && !(player.assists || 0) && !(player.totalMinutesPlayed || 0) && (
                <Badge variant="outline" className="text-gray-400">
                  No stats yet
                </Badge>
              )}

              {/* Cards (if any) */}
              {((player.yellowCards || 0) > 0 || (player.redCards || 0) > 0) && (
                <div className="flex gap-1">
                  {(player.yellowCards || 0) > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      🟨 {player.yellowCards}
                    </Badge>
                  )}
                  {(player.redCards || 0) > 0 && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      🟥 {player.redCards}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersList;
