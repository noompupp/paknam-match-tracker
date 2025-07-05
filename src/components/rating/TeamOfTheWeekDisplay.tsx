
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Crown, Award } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TeamOfTheWeekPlayer, CaptainOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { formatTeamOfTheWeekByPosition } from "@/utils/teamOfTheWeekSelection";
import TeamOfTheWeekPitchDisplay from "./TeamOfTheWeekPitchDisplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MiniPlayerAvatar from "@/components/dashboard/MiniPlayerAvatar";

interface TeamOfTheWeekDisplayProps {
  teamOfTheWeek: TeamOfTheWeekPlayer[];
  captainOfTheWeek: CaptainOfTheWeekPlayer | null;
}

const PlayerCard = ({ player, membersMap }: { 
  player: TeamOfTheWeekPlayer;
  membersMap: Map<number, any>;
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className={`relative ${player.isCaptain ? 'border-yellow-400 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
      {player.isCaptain && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
          <Crown className="h-4 w-4 text-white" />
        </div>
      )}
      <CardContent className="p-3">
        <div className="text-center space-y-2">
           <div className="w-14 h-14 mx-auto">
             <MiniPlayerAvatar
               name={player.player_name}
               imageUrl={membersMap.get(player.player_id)?.ProfileURL || membersMap.get(player.player_id)?.optimized_avatar_url}
               size={55}
               className={`${player.isCaptain ? 'ring-2 ring-yellow-400' : ''}`}
             />
           </div>
          <div className="font-bold text-sm">{player.player_name}</div>
          <div className="text-xs text-muted-foreground">{player.team_name}</div>
          <Badge variant="outline" className="text-xs">
            {player.position}
          </Badge>
          <div className="flex items-center justify-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-sm font-bold text-green-600">
              {player.rating_data.final_rating.toFixed(2)}
            </span>
          </div>
          {player.isCaptain && (
            <Badge className="bg-yellow-500 text-white text-xs">
              {t('rating.captain')}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CaptainOfTheWeekCard = ({ captain, membersMap }: { 
  captain: CaptainOfTheWeekPlayer;
  membersMap: Map<number, any>;
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="border-blue-400 bg-gradient-to-r from-blue-100 to-indigo-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-center flex items-center justify-center space-x-2 text-lg">
          <Award className="h-5 w-5 text-blue-600" />
          <span>🏆 Captain of the Week</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
         <div className="w-18 h-18 mx-auto mb-3">
           <MiniPlayerAvatar
             name={captain.player_name}
             imageUrl={membersMap.get(captain.player_id)?.ProfileURL || membersMap.get(captain.player_id)?.optimized_avatar_url}
             size={74}
             className="ring-2 ring-blue-400"
           />
         </div>
        <div className="font-bold text-xl">{captain.player_name}</div>
        <div className="text-muted-foreground">{captain.team_name} • {captain.position}</div>
        <Badge className="bg-blue-600 text-white mt-2">
          Team Captain
        </Badge>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="font-bold text-green-600 text-lg">
            {captain.rating_data.final_rating.toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Performance Score: {captain.teamPerformanceScore.toFixed(1)}
        </div>
      </CardContent>
    </Card>
  );
};

const TeamOfTheWeekDisplay: React.FC<TeamOfTheWeekDisplayProps> = ({ 
  teamOfTheWeek,
  captainOfTheWeek 
}) => {
  const { t } = useTranslation();
  
  // Fetch player data for avatars
  const { data: members } = useQuery({
    queryKey: ['members-for-totw-display'],
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
  
  if (!teamOfTheWeek || teamOfTheWeek.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">
            {t("rating.noApprovedRatings")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("rating.approveRatingsFirst")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const totwCaptain = teamOfTheWeek.find(p => p.isCaptain);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader className="text-center pb-3">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <span>{t("rating.teamOfTheWeek")}</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            7-a-side Formation • {teamOfTheWeek.length} Players Selected
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pitch Formation Display - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-4">
          {/* TOTW Captain Highlight */}
          {totwCaptain && (
            <Card className="border-yellow-400 bg-gradient-to-r from-yellow-100 to-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-center flex items-center justify-center space-x-2 text-lg">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <span>TOTW {t('rating.captain')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                 <div className="w-18 h-18 mx-auto mb-3">
                   <MiniPlayerAvatar
                     name={totwCaptain.player_name}
                     imageUrl={membersMap.get(totwCaptain.player_id)?.ProfileURL || membersMap.get(totwCaptain.player_id)?.optimized_avatar_url}
                     size={74}
                     className="ring-2 ring-yellow-400"
                   />
                 </div>
                <div className="font-bold text-xl">{totwCaptain.player_name}</div>
                <div className="text-muted-foreground">{totwCaptain.team_name} • {totwCaptain.position}</div>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-bold text-green-600 text-lg">
                    {totwCaptain.rating_data.final_rating.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2D Pitch Formation Display */}
          <TeamOfTheWeekPitchDisplay teamOfTheWeek={teamOfTheWeek} membersMap={membersMap} />

          {/* Summary Stats */}
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {teamOfTheWeek.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {teamOfTheWeek.reduce((acc, p) => acc + p.rating_data.final_rating, 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(teamOfTheWeek.reduce((acc, p) => acc + p.rating_data.final_rating, 0) / teamOfTheWeek.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Captain of the Week - Takes 1/3 width on large screens */}
        <div className="space-y-4">
          {captainOfTheWeek ? (
            <CaptainOfTheWeekCard captain={captainOfTheWeek} membersMap={membersMap} />
          ) : (
            <Card className="border-gray-200">
              <CardContent className="py-8 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  No Captain of the Week
                </p>
                <p className="text-sm text-muted-foreground">
                  No eligible team captains available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamOfTheWeekDisplay;
