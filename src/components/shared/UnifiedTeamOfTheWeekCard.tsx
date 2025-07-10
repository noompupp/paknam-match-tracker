import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Star, Crown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useCurrentWeeklyTOTW, useWeeklyPlayerPerformance } from "@/hooks/useWeeklyTOTW";
import { useLatestCompleteFixtures } from "@/hooks/useLatestCompleteFixtures";
import { useHybridPlayerRatings, useApprovedPlayerRatings } from "@/hooks/useHybridPlayerRatings";
import { selectTeamOfTheWeek, formatTeamOfTheWeekByPosition, type TeamOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MiniPlayerAvatar from "@/components/dashboard/MiniPlayerAvatar";

interface UnifiedTeamOfTheWeekCardProps {
  variant?: 'dashboard' | 'full';
}

const PlayerPitchCard = ({ 
  player, 
  membersMap, 
  variant = 'dashboard' 
}: { 
  player: TeamOfTheWeekPlayer;
  membersMap?: Map<number, any>;
  variant?: 'dashboard' | 'full';
}) => {
  const sizeClasses = variant === 'dashboard' 
    ? 'w-14 sm:w-16 md:w-20' 
    : 'w-20 sm:w-24 md:w-32 lg:w-36 xl:w-40';
  
  const avatarSize = variant === 'dashboard' ? 48 : 54; // Increased avatar size
  const textSize = variant === 'dashboard' ? 'text-[8px] sm:text-[9px]' : 'text-[10px] sm:text-xs';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative p-1.5 sm:p-2 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${
            player.isCaptain 
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 shadow-lg' 
              : 'border-primary/30 bg-gradient-to-br from-card to-card/80 shadow-md'
          } min-w-0 flex-shrink-0 ${sizeClasses}`}>
            {player.isCaptain && (
              <Crown className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 fill-yellow-400 bg-white rounded-full p-0.5" />
            )}
            
            <div className="flex flex-col items-center space-y-1">
              <div className={`${variant === 'dashboard' ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'}`}>
                <MiniPlayerAvatar
                  name={player.player_name}
                  imageUrl={membersMap?.get(player.player_id)?.ProfileURL || membersMap?.get(player.player_id)?.optimized_avatar_url}
                  size={avatarSize}
                  className={`${player.isCaptain ? 'ring-2 ring-yellow-400' : ''}`}
                />
              </div>
              
              <div className="text-center space-y-0.5 w-full">
                <div className={`font-bold ${textSize} leading-tight text-center`}>
                  {player.player_name.split(' ')[0]}
                </div>
                
                <div className={`${variant === 'dashboard' ? 'text-[7px] sm:text-[8px]' : 'text-[8px] sm:text-[10px]'} text-muted-foreground leading-tight`}>
                  {player.team_name.length > 8 ? `${player.team_name.substring(0, 6)}...` : player.team_name}
                </div>
                
                <div className="flex items-center justify-center space-x-0.5">
                  <Star className={`${variant === 'dashboard' ? 'h-1.5 w-1.5' : 'h-2 w-2'} text-yellow-500 fill-current`} />
                  <span className={`${variant === 'dashboard' ? 'text-[7px] sm:text-[8px]' : 'text-[8px] sm:text-[10px]'} font-bold text-foreground`}>
                    {player.rating_data.final_rating.toFixed(1)}
                  </span>
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
  variant = 'dashboard',
  isGoalkeeper = false 
}: { 
  players: TeamOfTheWeekPlayer[]; 
  membersMap?: Map<number, any>;
  variant?: 'dashboard' | 'full';
  isGoalkeeper?: boolean;
}) => {
  const gapClass = variant === 'dashboard' ? 'gap-1 sm:gap-2' : 'gap-2 sm:gap-3';
  const minHeight = variant === 'dashboard' ? 'min-h-[60px] sm:min-h-[70px]' : 'min-h-[80px] sm:min-h-[96px]';

  return (
    <div className={`flex justify-center items-center ${gapClass} ${minHeight} ${
      isGoalkeeper ? 'mb-0' : ''
    } ${players.length === 1 ? 'w-full justify-center' : 'flex-wrap'}`}>
      {players.map((player) => (
        <PlayerPitchCard key={player.player_id} player={player} membersMap={membersMap} variant={variant} />
      ))}
    </div>
  );
};

const UnifiedTeamOfTheWeekCard: React.FC<UnifiedTeamOfTheWeekCardProps> = ({ 
  variant = 'dashboard' 
}) => {
  const { t } = useTranslation();
  
  // First, try to get weekly TOTW data (prioritize manually saved lineups)
  const { data: weeklyTOTW } = useCurrentWeeklyTOTW();
  const { data: weeklyPerformance } = useWeeklyPlayerPerformance(weeklyTOTW?.id);
  
  // Fallback to fixture-based approach if no weekly TOTW exists
  const { data: fixtures } = useLatestCompleteFixtures();
  const fixture = (fixtures && fixtures.length > 0) ? fixtures[0] : null;
  const { data: hybridRatings } = useHybridPlayerRatings(fixture?.id || null);
  const { data: approvedRatings } = useApprovedPlayerRatings(fixture?.id || null);

  const { data: members } = useQuery({
    queryKey: ['members-for-unified-totw'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, ProfileURL, optimized_avatar_url, team_id');
      if (error) throw error;
      return data || [];
    }
  });

  const membersMap = new Map(
    (members || []).map(member => [member.id, member])
  );

  // Helper function to convert weekly performance to TeamOfTheWeekPlayer format
  const convertWeeklyPerformanceToTOTWPlayers = (performance: any[]): TeamOfTheWeekPlayer[] => {
    if (!performance || performance.length === 0) return [];
    
    // Sort by weighted final rating and take top 7
    const sortedPlayers = performance
      .sort((a, b) => b.weighted_final_rating - a.weighted_final_rating)
      .slice(0, 7);
    
    const captain = sortedPlayers[0]; // Highest rated player is captain
    
    return sortedPlayers.map(player => ({
      player_id: player.player_id,
      player_name: player.player_name,
      team_id: player.team_id,
      team_name: player.team_name,
      position: player.position,
      isCaptain: player.player_id === captain?.player_id,
      rating_data: {
        player_id: player.player_id,
        player_name: player.player_name,
        team_id: player.team_id,
        position: player.position,
        minutes_played: 90, // Default for weekly aggregation
        match_result: 'win', // Default for weekly aggregation
        fpl_points: Math.round(player.average_fpl_rating * 2), // Estimate
        fpl_rating: player.average_fpl_rating,
        participation_rating: player.average_participation_rating,
        final_rating: player.weighted_final_rating,
        rating_breakdown: {
          goals: player.total_goals || 0,
          assists: player.total_assists || 0,
          cards: player.total_cards || 0,
          goals_conceded: 0,
          clean_sheet_eligible: player.position?.includes('GK') || player.position?.includes('DF') || false
        }
      }
    }));
  };

  // Determine the team of the week to display
  let teamOfTheWeek: TeamOfTheWeekPlayer[] = [];
  
  if (weeklyTOTW && Array.isArray(weeklyTOTW.team_of_the_week) && weeklyTOTW.team_of_the_week.length > 0) {
    // Use manually saved weekly TOTW (highest priority)
    teamOfTheWeek = weeklyTOTW.team_of_the_week;
  } else if (weeklyPerformance && weeklyPerformance.length > 0) {
    // Use aggregated weekly performance data (second priority)
    teamOfTheWeek = convertWeeklyPerformanceToTOTWPlayers(weeklyPerformance);
  } else if (fixture && hybridRatings && approvedRatings) {
    // Fallback to fixture-based selection (lowest priority)
    const approvedMap = new Map(
      approvedRatings.map(rating => [rating.player_id, rating])
    );
    const approvedPlayerRatings = hybridRatings.filter(rating => 
      approvedMap.has(rating.player_id)
    );
    teamOfTheWeek = selectTeamOfTheWeek(approvedPlayerRatings, approvedMap);
  }

  // Only show "no matches" if we have no data at all
  if (!weeklyTOTW && !weeklyPerformance && !fixture) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span>{t("rating.teamOfTheWeek")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              {t("rating.noMatches")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (teamOfTheWeek.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span>{t("rating.teamOfTheWeek")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm mb-2">
              {t("rating.noApprovedRatings")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("rating.approveRatingsFirst")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formation = formatTeamOfTheWeekByPosition(teamOfTheWeek);
  const totwCaptain = teamOfTheWeek.find(p => p.isCaptain);
  const pitchHeight = variant === 'dashboard' ? 'h-[400px] sm:h-[450px]' : 'h-[600px] sm:h-[700px]';

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center space-x-2">
          <Trophy className="h-4 w-4 text-yellow-600" />
          <span>{t("rating.teamOfTheWeek")}</span>
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          {teamOfTheWeek.length}/7
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Professional Football Pitch Layout */}
        <div className={`relative bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-lg p-3 sm:p-4 ${pitchHeight} overflow-hidden`}>
          
          {/* Enhanced Pitch markings */}
          <div className="absolute inset-3 border-2 border-white/70 rounded">
            {/* Center line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/70 transform -translate-y-0.5" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-12 h-12 sm:w-16 sm:h-16 border-2 border-white/70 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            {/* Goal areas */}
            <div className="absolute top-0 left-1/4 w-1/2 h-6 sm:h-8 border-2 border-white/70 border-t-0" />
            <div className="absolute bottom-0 left-1/4 w-1/2 h-6 sm:h-8 border-2 border-white/70 border-b-0" />
            {/* Corner arcs */}
            <div className="absolute top-0 left-0 w-3 h-3 border-b-2 border-r-2 border-white/50 rounded-br-full" />
            <div className="absolute top-0 right-0 w-3 h-3 border-b-2 border-l-2 border-white/50 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-white/50 rounded-tr-full" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-t-2 border-l-2 border-white/50 rounded-tl-full" />
          </div>

          {/* Formation Display */}
          <div className="relative h-full grid grid-rows-4 gap-1 sm:gap-2 py-3 sm:py-4">
            {/* Forwards */}
            <div className="flex justify-center items-center">
              <FormationRow 
                players={formation.forwards}
                membersMap={membersMap}
                variant={variant}
              />
            </div>

            {/* Midfielders */}
            <div className="flex justify-center items-center">
              <FormationRow 
                players={formation.midfielders}
                membersMap={membersMap}
                variant={variant}
              />
            </div>

            {/* Defenders */}
            <div className="flex justify-center items-center">
              <FormationRow 
                players={formation.defenders}
                membersMap={membersMap}
                variant={variant}
              />
            </div>

            {/* Goalkeeper */}
            <div className="flex justify-center items-center">
              <FormationRow 
                players={formation.goalkeeper}
                membersMap={membersMap}
                variant={variant}
                isGoalkeeper={true}
              />
            </div>
          </div>

          {/* Info badges */}
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

          {/* Formation badge */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
            <span className="text-xs font-bold text-green-800">
              {formation.defenders.length}-{formation.midfielders.length}-{formation.forwards.length}
            </span>
          </div>
        </div>

        {/* Captain highlight */}
        {totwCaptain && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Crown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold">{totwCaptain.player_name}</div>
                <div className="text-xs text-muted-foreground">{totwCaptain.team_name}</div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-sm font-bold text-green-600">
                  {totwCaptain.rating_data.final_rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 text-center text-sm">
          <div>
            <div className="font-bold text-lg text-green-600">{teamOfTheWeek.length}</div>
            <div className="text-muted-foreground text-xs">Players</div>
          </div>
          <div>
            <div className="font-bold text-lg text-yellow-600">
              {(teamOfTheWeek.reduce((acc, p) => acc + p.rating_data.final_rating, 0) / teamOfTheWeek.length).toFixed(1)}
            </div>
            <div className="text-muted-foreground text-xs">Avg Rating</div>
          </div>
        </div>

        {/* View Full Team link - only show in dashboard variant */}
        {variant === 'dashboard' && (
          <div className="text-center">
            <button className="text-xs text-primary hover:underline">
              View Full Team →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedTeamOfTheWeekCard;
