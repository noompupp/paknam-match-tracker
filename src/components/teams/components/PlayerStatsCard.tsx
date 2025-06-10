import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Clock, Award } from "lucide-react";
import PlayerAvatar from "@/components/shared/PlayerAvatar";
import { Member, Team } from "@/types/database";

interface PlayerStatsCardProps {
  player: Member;
  teamData?: Team;
  index: number;
}

const PlayerStatsCard = ({ player, teamData, index }: PlayerStatsCardProps) => {
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

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <PlayerAvatar 
            player={{
              id: player.id,
              name: player.name || 'Unknown Player',
              number: player.number || (index + 1).toString(),
              position: player.position || 'Player',
              role: 'Player',
              goals: player.goals || 0,
              assists: player.assists || 0,
              yellow_cards: player.yellow_cards || 0,
              red_cards: player.red_cards || 0,
              total_minutes_played: player.total_minutes_played || 0,
              matches_played: player.matches_played || 0,
              team_id: player.team_id || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ProfileURL: player.ProfileURL
            }}
            team={teamData}
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
  );
};

export default PlayerStatsCard;
