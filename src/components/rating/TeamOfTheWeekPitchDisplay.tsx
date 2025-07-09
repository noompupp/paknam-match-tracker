import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
            <div className={`relative p-2 sm:p-3 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${
              player.isCaptain 
                ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 shadow-lg' 
                : 'border-primary/30 bg-gradient-to-br from-card to-card/80 shadow-md'
            } min-w-0 flex-shrink-0 w-20 sm:w-24 md:w-32 lg:w-36 xl:w-40`}>
            {player.isCaptain && (
              <Crown className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 fill-yellow-400 bg-white rounded-full p-0.5" />
            )}
            
            {/* Player Avatar */}
            <div className="flex flex-col items-center space-y-1.5 sm:space-y-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14">
                <MiniPlayerAvatar
                  name={player.player_name}
                  imageUrl={membersMap?.get(player.player_id)?.ProfileURL || membersMap?.get(player.player_id)?.optimized_avatar_url}
                  size={32}
                  className={`${player.isCaptain ? 'ring-2 ring-yellow-400' : ''}`}
                />
              </div>
              
              <div className="text-center space-y-0.5 w-full">
                {/* Player Name - Show first name but allow full name in tooltip */}
                <div className="font-bold text-[10px] sm:text-xs leading-tight text-center">
                  {player.player_name.split(' ')[0]}
                </div>
                
                {/* Team Name - Show abbreviated but full name in tooltip */}
                <div className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight">
                  {player.team_name.length > 12 ? `${player.team_name.substring(0, 8)}...` : player.team_name}
                </div>
                
                {/* Rating */}
                <div className="flex items-center justify-center space-x-0.5 sm:space-x-1">
                  <Star className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-yellow-500 fill-current" />
                  <span className="text-[8px] sm:text-[10px] font-bold text-foreground">
                    {player.rating_data.final_rating.toFixed(1)}
                  </span>
                </div>
                
                {/* Position indicator */}
                <div className="text-[7px] sm:text-[8px] text-muted-foreground/80 uppercase font-medium">
                  {player.position}
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-48">
          <div className="text-center space-y-1">
            <div className="font-semibold">{player.player_name}</div>
            <div className="text-sm text-muted-foreground">{player.team_name}</div>
            <div className="text-sm">Position: {player.position}</div>
            <div className="text-sm">Rating: {player.rating_data.final_rating.toFixed(2)}</div>
            {player.isCaptain && (
              <div className="text-sm text-yellow-600 font-medium flex items-center justify-center gap-1">
                <Crown className="h-3 w-3" />
                Team Captain
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
  // Always render the row to maintain grid structure, even if empty
  return (
    <div className={`flex justify-center items-center gap-2 sm:gap-3 min-h-[80px] sm:min-h-[96px] ${
      isGoalkeeper ? 'mb-0' : ''
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

        {/* Formation Display - Fixed 4-Row Grid Structure */}
        <div className="relative h-full grid grid-rows-4 gap-1 sm:gap-3 py-3 sm:py-6">
          
          {/* Row 1: Forwards (Attack Zone) */}
          <div className="flex justify-center items-center min-h-[60px] sm:min-h-[80px]">
            <FormationRow 
              players={formation.forwards}
              membersMap={membersMap}
            />
          </div>

          {/* Row 2: Midfielders (Midfield Zone) */}
          <div className="flex justify-center items-center min-h-[60px] sm:min-h-[80px]">
            <FormationRow 
              players={formation.midfielders}
              membersMap={membersMap}
            />
          </div>

          {/* Row 3: Defenders (Defense Zone) */}
          <div className="flex justify-center items-center min-h-[60px] sm:min-h-[80px]">
            <FormationRow 
              players={formation.defenders}
              membersMap={membersMap}
            />
          </div>

          {/* Row 4: Goalkeeper (Goal Zone) */}
          <div className="flex justify-center items-center min-h-[60px] sm:min-h-[80px]">
            <FormationRow 
              players={formation.goalkeeper}
              membersMap={membersMap}
              isGoalkeeper={true}
            />
          </div>
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

          {/* Formation Badge - Bottom (excluding goalkeeper) */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
            <span className="text-xs font-bold text-green-800">
              {formation.defenders.length}-{formation.midfielders.length}-{formation.forwards.length}
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
              Formation: {formation.defenders.length}-{formation.midfielders.length}-{formation.forwards.length}
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
