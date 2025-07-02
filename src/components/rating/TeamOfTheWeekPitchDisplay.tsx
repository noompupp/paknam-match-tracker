import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star } from "lucide-react";
import type { TeamOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { formatTeamOfTheWeekByPosition } from "@/utils/teamOfTheWeekSelection";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface TeamOfTheWeekPitchDisplayProps {
  teamOfTheWeek: TeamOfTheWeekPlayer[];
}

const PlayerPitchCard = ({ player }: { player: TeamOfTheWeekPlayer }) => {
  return (
    <div className={`relative p-2 rounded-lg border-2 transition-all hover:scale-105 ${
      player.isCaptain 
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg' 
        : 'border-green-300 bg-gradient-to-br from-green-50 to-blue-50 shadow-md'
    } min-w-0 flex-shrink-0 w-20 sm:w-24`}>
      {player.isCaptain && (
        <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-600 fill-yellow-400" />
      )}
      
      <div className="text-center space-y-1">
        <div className="font-bold text-xs leading-tight truncate" title={player.player_name}>
          {player.player_name.split(' ').map((name, i) => i === 0 ? name.charAt(0) + '.' : name).join(' ')}
        </div>
        <div className="text-xs text-muted-foreground truncate" title={player.team_name}>
          {player.team_name.length > 6 ? player.team_name.substring(0, 6) + '...' : player.team_name}
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          <Star className="h-2.5 w-2.5 text-yellow-500 fill-current" />
          <span className="text-xs font-bold text-green-600">
            {player.rating_data.final_rating.toFixed(1)}
          </span>
        </div>
        
        <Badge variant="outline" className="text-xs px-1 py-0 h-3.5">
          {player.position}
        </Badge>
      </div>
    </div>
  );
};

const FormationRow = ({ 
  players, 
  label, 
  isGoalkeeper = false 
}: { 
  players: TeamOfTheWeekPlayer[]; 
  label: string;
  isGoalkeeper?: boolean;
}) => {
  if (players.length === 0) return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs font-medium text-white/80 uppercase tracking-wide">
        {label}
      </div>
      <div className={`flex justify-center items-center gap-2 ${
        isGoalkeeper ? 'mb-2' : ''
      } ${players.length === 1 ? 'w-full justify-center' : 'flex-wrap'}`}>
        {players.map((player) => (
          <PlayerPitchCard key={player.player_id} player={player} />
        ))}
      </div>
    </div>
  );
};

const TeamOfTheWeekPitchDisplay: React.FC<TeamOfTheWeekPitchDisplayProps> = ({ 
  teamOfTheWeek 
}) => {
  const { isPortrait } = useDeviceOrientation();

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
        {/* Vertical Football Pitch Layout */}
        <div className="relative bg-gradient-to-b from-green-400 to-green-500 rounded-lg p-4 min-h-[500px] overflow-hidden">
          
          {/* Pitch markings - Portrait orientation */}
          <div className="absolute inset-2 border-2 border-white/60 rounded">
            {/* Center line - horizontal for portrait */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/60 transform -translate-y-0.5" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white/60 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            {/* Goal areas - top and bottom */}
            <div className="absolute top-0 left-1/3 w-1/3 h-8 border-2 border-white/60 border-t-0" />
            <div className="absolute bottom-0 left-1/3 w-1/3 h-8 border-2 border-white/60 border-b-0" />
          </div>

          {/* Formation Display - Vertical Layout (Attack to Defense) */}
          <div className="relative h-full flex flex-col justify-between py-8 space-y-6">
            
            {/* Attack - Forwards at the top */}
            <FormationRow 
              players={formation.forwards} 
              label="Attack"
            />

            {/* Midfield Area */}
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {/* Advanced Midfield - Wingers */}
              <FormationRow 
                players={formation.wingers} 
                label="Wings"
              />
              
              {/* Central Midfield */}
              <FormationRow 
                players={formation.midfielders} 
                label="Midfield"
              />
            </div>

            {/* Defense */}
            <FormationRow 
              players={formation.defenders} 
              label="Defense"
            />

            {/* Goalkeeper at the bottom */}
            <FormationRow 
              players={formation.goalkeeper} 
              label="Goalkeeper"
              isGoalkeeper={true}
            />
          </div>

          {/* Formation Info - Top Left */}
          <div className="absolute top-2 left-2 bg-white/90 rounded px-2 py-1">
            <span className="text-xs font-semibold text-green-800">
              7-a-side Formation
            </span>
          </div>

          {/* Player Count - Top Right */}
          <div className="absolute top-2 right-2 bg-white/90 rounded px-2 py-1">
            <span className="text-xs font-semibold text-green-800">
              {teamOfTheWeek.length} / 7 Players
            </span>
          </div>

          {/* Team of the Week Badge - Bottom Center */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 rounded-full px-3 py-1">
            <span className="text-xs font-bold text-green-800">
              Team of the Week
            </span>
          </div>
        </div>

        {/* Legend - Mobile Optimized */}
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
            Based on Performance
          </div>
        </div>

        {/* Formation Summary */}
        {teamOfTheWeek.length > 0 && (
          <div className="mt-3 text-center">
            <p className="text-sm text-muted-foreground">
              Formation: {formation.goalkeeper.length}-{formation.defenders.length}-{formation.midfielders.length + formation.wingers.length}-{formation.forwards.length}
              {teamOfTheWeek.find(p => p.isCaptain) && (
                <span className="ml-2 text-yellow-600 font-medium">
                  • Captain: {teamOfTheWeek.find(p => p.isCaptain)?.player_name}
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamOfTheWeekPitchDisplay;
