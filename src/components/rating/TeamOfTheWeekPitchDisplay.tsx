import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star } from "lucide-react";
import type { TeamOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { formatTeamOfTheWeekByPosition } from "@/utils/teamOfTheWeekSelection";

interface TeamOfTheWeekPitchDisplayProps {
  teamOfTheWeek: TeamOfTheWeekPlayer[];
}

const PlayerPitchCard = ({ player }: { player: TeamOfTheWeekPlayer }) => {
  return (
    <div className={`relative p-2 rounded-lg border-2 transition-all hover:scale-105 ${
      player.isCaptain 
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg' 
        : 'border-green-300 bg-gradient-to-br from-green-50 to-blue-50 shadow-md'
    }`}>
      {player.isCaptain && (
        <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-600 fill-yellow-400" />
      )}
      
      <div className="text-center space-y-1">
        <div className="font-bold text-xs leading-tight">{player.player_name}</div>
        <div className="text-xs text-muted-foreground truncate">{player.team_name}</div>
        
        <div className="flex items-center justify-center space-x-1">
          <Star className="h-3 w-3 text-yellow-500 fill-current" />
          <span className="text-xs font-bold text-green-600">
            {player.rating_data.final_rating.toFixed(1)}
          </span>
        </div>
        
        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
          {player.position}
        </Badge>
      </div>
    </div>
  );
};

const TeamOfTheWeekPitchDisplay: React.FC<TeamOfTheWeekPitchDisplayProps> = ({ 
  teamOfTheWeek 
}) => {
  if (!teamOfTheWeek || teamOfTheWeek.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-8 text-center">
          <div className="text-green-600 mb-2">⚽</div>
          <p className="text-muted-foreground">No players selected for Team of the Week</p>
        </CardContent>
      </Card>
    );
  }

  const formation = formatTeamOfTheWeekByPosition(teamOfTheWeek);

  return (
    <Card className="bg-gradient-to-b from-green-100 to-green-200 border-green-300">
      <CardContent className="p-4">
        {/* Football Pitch Layout */}
        <div className="relative bg-green-400 rounded-lg p-4 min-h-96">
          {/* Pitch markings */}
          <div className="absolute inset-2 border-2 border-white rounded">
            {/* Center line */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white transform -translate-x-0.5" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            {/* Goal areas */}
            <div className="absolute top-1/3 left-0 w-8 h-1/3 border-2 border-white border-l-0" />
            <div className="absolute top-1/3 right-0 w-8 h-1/3 border-2 border-white border-r-0" />
          </div>

          {/* Formation Layout - 7-a-side typical 3-2-1 */}
          <div className="relative h-full flex flex-col justify-between py-8">
            {/* Forwards */}
            {formation.forwards.length > 0 && (
              <div className="flex justify-center space-x-4">
                {formation.forwards.map((player) => (
                  <PlayerPitchCard key={player.player_id} player={player} />
                ))}
              </div>
            )}

            {/* Wingers and Midfielders */}
            <div className="flex justify-between items-center px-4">
              <div className="flex flex-col space-y-2">
                {formation.wingers.slice(0, Math.ceil(formation.wingers.length / 2)).map((player) => (
                  <PlayerPitchCard key={player.player_id} player={player} />
                ))}
              </div>
              
              <div className="flex space-x-4">
                {formation.midfielders.map((player) => (
                  <PlayerPitchCard key={player.player_id} player={player} />
                ))}
              </div>
              
              <div className="flex flex-col space-y-2">
                {formation.wingers.slice(Math.ceil(formation.wingers.length / 2)).map((player) => (
                  <PlayerPitchCard key={player.player_id} player={player} />
                ))}
              </div>
            </div>

            {/* Defenders */}
            {formation.defenders.length > 0 && (
              <div className="flex justify-center space-x-4">
                {formation.defenders.map((player) => (
                  <PlayerPitchCard key={player.player_id} player={player} />
                ))}
              </div>
            )}

            {/* Goalkeeper */}
            {formation.goalkeeper.length > 0 && (
              <div className="flex justify-center">
                {formation.goalkeeper.map((player) => (
                  <PlayerPitchCard key={player.player_id} player={player} />
                ))}
              </div>
            )}
          </div>

          {/* Formation Label */}
          <div className="absolute top-2 left-2 bg-white/80 rounded px-2 py-1">
            <span className="text-xs font-semibold text-green-800">
              7-a-side Formation
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <Crown className="h-3 w-3 text-yellow-600" />
            <span>Captain</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>Rating</span>
          </div>
          <div className="text-muted-foreground">
            {teamOfTheWeek.length}/7 Players
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamOfTheWeekPitchDisplay;
