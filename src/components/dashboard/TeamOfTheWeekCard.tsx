
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Crown, Award } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLatestCompleteFixtures } from "@/hooks/useLatestCompleteFixtures";
import { useHybridPlayerRatings, useApprovedPlayerRatings } from "@/hooks/useHybridPlayerRatings";
import { selectTeamOfTheWeek, selectCaptainOfTheWeek } from "@/utils/teamOfTheWeekSelection";

const TeamOfTheWeekCard: React.FC = () => {
  const { t } = useTranslation();
  const { data: fixtures } = useLatestCompleteFixtures();
  
  // Get the most recent fixture
  const fixture = (fixtures && fixtures.length > 0) ? fixtures[0] : null;
  
  // Fetch ratings data
  const { data: hybridRatings } = useHybridPlayerRatings(fixture?.id || null);
  const { data: approvedRatings } = useApprovedPlayerRatings(fixture?.id || null);

  // Calculate Team of the Week
  const approvedMap = new Map(
    (approvedRatings || []).map(rating => [rating.player_id, rating])
  );

  const approvedPlayerRatings = (hybridRatings || []).filter(rating => 
    approvedMap.has(rating.player_id)
  );

  const teamOfTheWeek = selectTeamOfTheWeek(approvedPlayerRatings, approvedMap);
  const captainOfTheWeek = selectCaptainOfTheWeek(approvedPlayerRatings, approvedMap, teamOfTheWeek);

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

  const totwCaptain = teamOfTheWeek.find(p => p.isCaptain);

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
        {/* TOTW Captain */}
        {totwCaptain && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('rating.captain')}
              </span>
            </div>
            <div className="text-sm font-bold">{totwCaptain.player_name}</div>
            <div className="text-xs text-muted-foreground">{totwCaptain.team_name}</div>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs font-bold text-green-600">
                {totwCaptain.rating_data.final_rating.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Captain of the Week */}
        {captainOfTheWeek && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Captain of the Week
              </span>
            </div>
            <div className="text-sm font-bold">{captainOfTheWeek.player_name}</div>
            <div className="text-xs text-muted-foreground">{captainOfTheWeek.team_name}</div>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs font-bold text-green-600">
                {captainOfTheWeek.rating_data.final_rating.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-lg text-green-600">{teamOfTheWeek.length}</div>
            <div className="text-muted-foreground">Players</div>
          </div>
          <div>
            <div className="font-bold text-lg text-yellow-600">
              {teamOfTheWeek.reduce((acc, p) => acc + p.rating_data.final_rating, 0).toFixed(1)}
            </div>
            <div className="text-muted-foreground">Total Rating</div>
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center">
          <button className="text-xs text-primary hover:underline">
            View Full Team →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamOfTheWeekCard;
