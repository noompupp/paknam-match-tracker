import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Crown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLatestCompleteFixtures } from "@/hooks/useLatestCompleteFixtures";
import { useHybridPlayerRatings, useApprovedPlayerRatings, type ApprovedRating } from "@/hooks/useHybridPlayerRatings";
import { selectTeamOfTheWeek, formatTeamOfTheWeekByPosition } from "@/utils/teamOfTheWeekSelection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MiniPlayerAvatar from "./MiniPlayerAvatar";

const CompactTeamOfTheWeekCard: React.FC = () => {
  const { t } = useTranslation();
  const { data: fixtures } = useLatestCompleteFixtures();
  
  // Get the most recent fixture
  const fixture = (fixtures && fixtures.length > 0) ? fixtures[0] : null;
  
  // Fetch ratings data
  const { data: hybridRatings } = useHybridPlayerRatings(fixture?.id || null);
  const { data: approvedRatings } = useApprovedPlayerRatings(fixture?.id || null);

  // Fetch player data for avatars
  const { data: members } = useQuery({
    queryKey: ['members-for-compact-totw'],
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

  // Calculate Team of the Week
  const approvedMap = new Map<number, ApprovedRating>(
    (approvedRatings || []).map(rating => [rating.player_id, rating])
  );

  const approvedPlayerRatings = (hybridRatings || []).filter(rating => 
    approvedMap.has(rating.player_id)
  );

  const teamOfTheWeek = selectTeamOfTheWeek(approvedPlayerRatings, approvedMap);

  if (!fixture) {
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

  const CompactPlayerCard = ({ player }: { player: any }) => (
    <div className={`relative flex flex-col items-center p-1.5 rounded-lg border transition-all ${
      player.isCaptain 
        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
        : 'border-primary/20 bg-card/50'
    } min-w-0`}>
      {player.isCaptain && (
        <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-600 fill-yellow-400 bg-white rounded-full p-0.5" />
      )}
      
      <div className="w-6 h-6">
        <MiniPlayerAvatar
          name={player.player_name}
          imageUrl={membersMap?.get(player.player_id)?.ProfileURL || membersMap?.get(player.player_id)?.optimized_avatar_url}
          size={24}
          className={`${player.isCaptain ? 'ring-1 ring-yellow-400' : ''}`}
        />
      </div>
      
      <div className="text-center mt-1">
        <div className="text-[8px] font-medium leading-tight">
          {player.player_name.split(' ')[0]}
        </div>
        <div className="flex items-center justify-center space-x-0.5">
          <Star className="h-1.5 w-1.5 text-yellow-500 fill-current" />
          <span className="text-[7px] font-bold">
            {player.rating_data.final_rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );

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
      <CardContent className="space-y-3">
        {/* Compact Formation Display */}
        <div className="relative bg-gradient-to-b from-green-400 to-green-600 rounded-lg p-2 h-48">
          {/* Pitch markings */}
          <div className="absolute inset-2 border border-white/50 rounded">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/50 transform -translate-y-px" />
            <div className="absolute top-1/2 left-1/2 w-6 h-6 border border-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Formation Grid */}
          <div className="relative h-full grid grid-rows-4 gap-1 py-2">
            {/* Forwards */}
            <div className="flex justify-center items-center gap-1">
              {formation.forwards.map((player) => (
                <CompactPlayerCard key={player.player_id} player={player} />
              ))}
            </div>

            {/* Midfielders */}
            <div className="flex justify-center items-center gap-1">
              {formation.midfielders.map((player) => (
                <CompactPlayerCard key={player.player_id} player={player} />
              ))}
            </div>

            {/* Defenders */}
            <div className="flex justify-center items-center gap-1">
              {formation.defenders.map((player) => (
                <CompactPlayerCard key={player.player_id} player={player} />
              ))}
            </div>

            {/* Goalkeeper */}
            <div className="flex justify-center items-center">
              {formation.goalkeeper.map((player) => (
                <CompactPlayerCard key={player.player_id} player={player} />
              ))}
            </div>
          </div>

          {/* Formation badge */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-white/90 rounded-full px-2 py-0.5">
            <span className="text-[8px] font-bold text-green-800">
              {formation.defenders.length}-{formation.midfielders.length}-{formation.forwards.length}
            </span>
          </div>
        </div>

        {/* Captain highlight */}
        {totwCaptain && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
            <div className="flex items-center space-x-2">
              <Crown className="h-3 w-3 text-yellow-600" />
              <div className="flex-1">
                <div className="text-xs font-bold">{totwCaptain.player_name}</div>
                <div className="text-[10px] text-muted-foreground">{totwCaptain.team_name}</div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-2.5 w-2.5 text-yellow-500 fill-current" />
                <span className="text-xs font-bold text-green-600">
                  {totwCaptain.rating_data.final_rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-sm text-green-600">{teamOfTheWeek.length}</div>
            <div className="text-muted-foreground text-[10px]">Players</div>
          </div>
          <div>
            <div className="font-bold text-sm text-yellow-600">
              {(teamOfTheWeek.reduce((acc, p) => acc + p.rating_data.final_rating, 0) / teamOfTheWeek.length).toFixed(1)}
            </div>
            <div className="text-muted-foreground text-[10px]">Avg Rating</div>
          </div>
        </div>

        {/* View Full Team link */}
        <div className="text-center">
          <button className="text-xs text-primary hover:underline">
            View Full Team →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactTeamOfTheWeekCard;
