
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
    <div className={`relative p-1.5 sm:p-2 rounded-lg border-2 transition-all hover:scale-105 ${
      player.isCaptain 
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg' 
        : 'border-green-300 bg-gradient-to-br from-green-50 to-blue-50 shadow-md'
    } min-w-0 flex-shrink-0`}>
      {player.isCaptain && (
        <Crown className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 fill-yellow-400" />
      )}
      
      <div className="text-center space-y-0.5 sm:space-y-1">
        <div className="font-bold text-xs sm:text-sm leading-tight truncate" title={player.player_name}>
          {player.player_name}
        </div>
        <div className="text-xs text-muted-foreground truncate" title={player.team_name}>
          {player.team_name}
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500 fill-current" />
          <span className="text-xs font-bold text-green-600">
            {player.rating_data.final_rating.toFixed(1)}
          </span>
        </div>
        
        <Badge variant="outline" className="text-xs px-1 py-0 h-3.5 sm:h-4">
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
      <CardContent className="p-2 sm:p-4">
        {/* Mobile-Optimized Football Pitch Layout */}
        <div className="relative bg-green-400 rounded-lg p-2 sm:p-4 min-h-80 sm:min-h-96">
          {/* Pitch markings - simplified for mobile */}
          <div className="absolute inset-1 sm:inset-2 border-2 border-white rounded">
            {/* Center line */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white transform -translate-x-0.5" />
            {/* Center circle - smaller on mobile */}
            <div className="absolute top-1/2 left-1/2 w-12 h-12 sm:w-16 sm:h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            {/* Goal areas - simplified */}
            <div className="absolute top-1/3 left-0 w-4 sm:w-8 h-1/3 border-2 border-white border-l-0" />
            <div className="absolute top-1/3 right-0 w-4 sm:w-8 h-1/3 border-2 border-white border-r-0" />
          </div>

          {/* Mobile-First Formation Layout - Portrait Orientation */}
          <div className="relative h-full flex flex-col justify-between py-4 sm:py-8 space-y-2 sm:space-y-4">
            
            {/* Forwards - Top */}
            {formation.forwards.length > 0 && (
              <div className="flex justify-center space-x-1 sm:space-x-2 flex-wrap gap-1">
                {formation.forwards.map((player) => (
                  <PlayerPitchCard key={player.player_id} player={player} />
                ))}
              </div>
            )}

            {/* Wingers and Midfielders - Flexible Mobile Layout */}
            <div className="flex-1 flex flex-col justify-center space-y-2 sm:space-y-3">
              
              {/* Wingers Row */}
              {formation.wingers.length > 0 && (
                <div className="flex justify-center space-x-1 sm:space-x-2 flex-wrap gap-1">
                  {formation.wingers.map((player) => (
                    <PlayerPitchCard key={player.player_id} player={player} />
                  ))}
                </div>
              )}
              
              {/* Midfielders Row */}
              {formation.midfielders.length > 0 && (
                <div className="flex justify-center space-x-1 sm:space-x-2 flex-wrap gap-1">
                  {formation.midfielders.map((player) => (
                    <PlayerPitchCard key={player.player_id} player={player} />
                  ))}
                </div>
              )}
            </div>

            {/* Defenders - Lower Middle */}
            {formation.defenders.length > 0 && (
              <div className="flex justify-center space-x-1 sm:space-x-2 flex-wrap gap-1">
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

          {/* Formation Label - Mobile Optimized */}
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-white/80 rounded px-1.5 py-0.5 sm:px-2 sm:py-1">
            <span className="text-xs font-semibold text-green-800">
              7-a-side
            </span>
          </div>

          {/* Player Count Indicator */}
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/80 rounded px-1.5 py-0.5 sm:px-2 sm:py-1">
            <span className="text-xs font-semibold text-green-800">
              {teamOfTheWeek.length}/7
            </span>
          </div>
        </div>

        {/* Legend - Mobile Optimized */}
        <div className="mt-2 sm:mt-4 flex items-center justify-center space-x-3 sm:space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <Crown className="h-3 w-3 text-yellow-600" />
            <span>Captain</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>Rating</span>
          </div>
          <div className="text-muted-foreground">
            {teamOfTheWeek.length} Players
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamOfTheWeekPitchDisplay;
