import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star } from "lucide-react";
import type { TeamOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { formatTeamOfTheWeekByPosition } from "@/utils/teamOfTheWeekSelection";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import MiniPlayerAvatar from "@/components/dashboard/MiniPlayerAvatar";

interface TeamOfTheWeekPitchDisplayProps {
  teamOfTheWeek: TeamOfTheWeekPlayer[];
  membersMap?: Map<number, any>;
}

const PlayerPitchCard = ({ player, membersMap }: { 
  player: TeamOfTheWeekPlayer;
  membersMap?: Map<number, any>;
}) => {
  return (
    <div className={`relative p-3 rounded-xl border-2 transition-all hover:scale-105 ${
      player.isCaptain 
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg' 
        : 'border-primary/30 bg-gradient-to-br from-card to-card/80 shadow-md'
    } min-w-0 flex-shrink-0 w-16 sm:w-20`}>
      {player.isCaptain && (
        <Crown className="absolute -top-2 -right-2 h-5 w-5 text-yellow-600 fill-yellow-400 bg-white rounded-full p-0.5" />
      )}
      
      {/* Player Avatar */}
      <div className="flex flex-col items-center space-y-2">
      <div className="w-8 h-8 sm:w-10 sm:h-10">
        <MiniPlayerAvatar
          name={player.player_name}
          imageUrl={membersMap?.get(player.player_id)?.ProfileURL || membersMap?.get(player.player_id)?.optimized_avatar_url}
          size={32}
          className={`${player.isCaptain ? 'ring-2 ring-yellow-400' : ''}`}
        />
      </div>
        
        <div className="text-center space-y-1">
          <div className="font-bold text-xs leading-tight text-center" title={player.player_name}>
            {player.player_name.split(' ')[0]}
          </div>
          <div className="text-[10px] text-muted-foreground truncate" title={player.team_name}>
            {player.team_name.substring(0, 4)}
          </div>
          
          <div className="flex items-center justify-center space-x-1">
            <Star className="h-2 w-2 text-yellow-500 fill-current" />
            <span className="text-[10px] font-bold text-foreground">
              {player.rating_data.final_rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormationRow = ({ 
  players, 
  membersMap,
  isGoalkeeper = false 
}: { 
  players: TeamOfTheWeekPlayer[]; 
  membersMap?: Map<number, any>;
  isGoalkeeper?: boolean;
}) => {
  if (players.length === 0) return null;

  return (
    <div className={`flex justify-center items-center gap-2 sm:gap-3 ${
      isGoalkeeper ? 'mb-2' : ''
    } ${players.length === 1 ? 'w-full justify-center' : 'flex-wrap'}`}>
      {players.map((player) => (
        <PlayerPitchCard key={player.player_id} player={player} membersMap={membersMap} />
      ))}
    </div>
  );
};

const TeamOfTheWeekPitchDisplay: React.FC<TeamOfTheWeekPitchDisplayProps> = ({ 
  teamOfTheWeek,
  membersMap 
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
    <Card className="bg-gradient-to-b from-card to-card/90 border border-border">
      <CardContent className="p-3 sm:p-4">
        {/* Mobile-First Vertical Football Pitch Layout */}
        <div className="relative bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-lg p-3 sm:p-4 h-[600px] sm:h-[700px] overflow-hidden">
          
          {/* Enhanced Pitch markings - Portrait orientation */}
          <div className="absolute inset-3 border-2 border-white/70 rounded">
            {/* Center line - horizontal */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/70 transform -translate-y-0.5" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-12 h-12 sm:w-16 sm:h-16 border-2 border-white/70 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            {/* Goal areas - top and bottom */}
            <div className="absolute top-0 left-1/4 w-1/2 h-6 sm:h-8 border-2 border-white/70 border-t-0" />
            <div className="absolute bottom-0 left-1/4 w-1/2 h-6 sm:h-8 border-2 border-white/70 border-b-0" />
            {/* Corner arcs */}
            <div className="absolute top-0 left-0 w-3 h-3 border-b-2 border-r-2 border-white/50 rounded-br-full" />
            <div className="absolute top-0 right-0 w-3 h-3 border-b-2 border-l-2 border-white/50 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-white/50 rounded-tr-full" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-t-2 border-l-2 border-white/50 rounded-tl-full" />
          </div>

          {/* Formation Display - Mobile-First Vertical Layout */}
          <div className="relative h-full flex flex-col justify-between py-6 sm:py-8">
            
            {/* Attack Zone - Forwards at the top */}
            <div className="flex justify-center">
              <FormationRow 
                players={formation.forwards}
                membersMap={membersMap}
              />
            </div>

            {/* Advanced Midfield Zone */}
            {formation.wingers.length > 0 && (
              <div className="flex justify-center">
                <FormationRow 
                  players={formation.wingers}
                  membersMap={membersMap}
                />
              </div>
            )}

            {/* Central Midfield Zone */}
            {formation.midfielders.length > 0 && (
              <div className="flex justify-center">
                <FormationRow 
                  players={formation.midfielders}
                  membersMap={membersMap}
                />
              </div>
            )}

            {/* Defense Zone - FIXED: Place defenders above goalkeeper */}
            {formation.defenders.length > 0 && (
              <div className="flex justify-center">
                <FormationRow 
                  players={formation.defenders}
                  membersMap={membersMap}
                />
              </div>
            )}

            {/* Goalkeeper Zone - at the bottom */}
            {formation.goalkeeper.length > 0 && (
              <div className="flex justify-center">
                <FormationRow 
                  players={formation.goalkeeper}
                  membersMap={membersMap}
                  isGoalkeeper={true}
                />
              </div>
            )}
          </div>

          {/* Mobile-Optimized Info Badges */}
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
            <span className="text-[10px] sm:text-xs font-semibold text-green-800">
              {teamOfTheWeek.length}/7
            </span>
          </div>

          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
            <span className="text-[10px] sm:text-xs font-semibold text-green-800">
              TOTW
            </span>
          </div>

          {/* Formation Badge - Bottom */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
            <span className="text-xs font-bold text-green-800">
              {formation.goalkeeper.length}-{formation.defenders.length}-{formation.midfielders.length + formation.wingers.length}-{formation.forwards.length}
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
