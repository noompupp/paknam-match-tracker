
import React from "react";
import { useLatestCompleteFixtures } from "@/hooks/useLatestCompleteFixtures";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calculator, Users, Trophy, Edit3 } from "lucide-react";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { useToast } from "@/hooks/use-toast";
import RatingFixtureHeader from "./rating/RatingFixtureHeader";
import EnhancedPlayerRating from "./rating/EnhancedPlayerRating";
import TeamOfTheWeekDisplay from "./rating/TeamOfTheWeekDisplay";
import { 
  useHybridPlayerRatings, 
  useApprovedPlayerRatings, 
  useApprovePlayerRating,
  useCanApproveRatings,
  type PlayerRatingRow,
  type ApprovedRating
} from "@/hooks/useHybridPlayerRatings";
import { selectTeamOfTheWeek, selectCaptainOfTheWeek } from "@/utils/teamOfTheWeekSelection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TeamOfTheWeek: React.FC = () => {
  const { data: fixtures, isLoading, error } = useLatestCompleteFixtures();
  const { t } = useTranslation();
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const { canApprove } = useCanApproveRatings();

  // Currently only supporting one fixture (most recent), could be expanded
  const fixture = (fixtures && fixtures.length > 0) ? fixtures[0] : null;

  // Fetch hybrid ratings for this fixture
  const {
    data: hybridRatings,
    isLoading: ratingsLoading,
    error: ratingsError,
  } = useHybridPlayerRatings(fixture?.id || null);

  // Fetch approved ratings
  const {
    data: approvedRatings,
    isLoading: approvedLoading,
  } = useApprovedPlayerRatings(fixture?.id || null);

  const approveMutation = useApprovePlayerRating();

  if (isLoading || ratingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || ratingsError) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="font-semibold text-destructive mb-2">{t("common.error")}:</p>
        <p>{error?.message || ratingsError?.message || "An error occurred"}</p>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="gradient-bg min-h-screen">
        <UnifiedPageHeader
          title={t("nav.rating") || "Team of the Week"}
          logoSize="medium"
          showLanguageToggle={true}
        />
        <div className="max-w-2xl mx-auto py-6 px-2 sm:px-6">
          <p className="text-center text-muted-foreground">
            {t("rating.noMatches")}
          </p>
        </div>
      </div>
    );
  }

  const handleApproveRating = async (
    playerRating: PlayerRatingRow, 
    adjustedFplRating?: number, 
    adjustedParticipationRating?: number
  ) => {
    try {
      await approveMutation.mutateAsync({
        fixtureId: fixture.id,
        playerId: playerRating.player_id,
        playerName: playerRating.player_name,
        teamId: playerRating.team_id,
        position: playerRating.position,
        adjustedFplRating,
        adjustedParticipationRating
      });

      const wasAdjusted = adjustedFplRating !== undefined || adjustedParticipationRating !== undefined;
      
      toast({
        title: t("rating.approved"),
        description: wasAdjusted 
          ? `${t("rating.ratingApprovedFor")} ${playerRating.player_name} (with adjustments)`
          : `${t("rating.ratingApprovedFor")} ${playerRating.player_name}`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: t("common.error"),
        description: (err as any)?.message ?? "Failed to approve rating.",
        variant: "destructive",
      });
    }
  };

  // Group ratings by approval status
  const approvedMap = new Map<number, ApprovedRating>(
    (approvedRatings || []).map(rating => [rating.player_id, rating])
  );

  const approvedPlayerRatings = (hybridRatings || []).filter(rating => 
    approvedMap.has(rating.player_id)
  );

  const pendingPlayerRatings = (hybridRatings || []).filter(rating => 
    !approvedMap.has(rating.player_id)
  );

  // Calculate Team of the Week (7 players + 1 captain)
  const teamOfTheWeek = selectTeamOfTheWeek(approvedPlayerRatings, approvedMap);

  // Calculate Captain of the Week
  const captainOfTheWeek = selectCaptainOfTheWeek(approvedPlayerRatings, approvedMap, teamOfTheWeek);

  // Count adjusted ratings
  const adjustedRatingsCount = (approvedRatings || []).filter(rating => rating.was_adjusted).length;

  return (
    <div className="gradient-bg min-h-screen">
      <UnifiedPageHeader
        title={t("nav.rating") || "Team of the Week"}
        logoSize="medium"
        showLanguageToggle={true}
      />
      
      <div className="max-w-4xl mx-auto py-6 px-2 sm:px-6">
        <RatingFixtureHeader fixture={fixture} className="mb-6" />

        {!user && (
          <Card className="mb-6">
            <CardContent className="py-4 text-center">
              <p className="text-muted-foreground">
                {t("message.signInRequired")}
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="ratings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ratings" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>{t("rating.hybridRatings")}</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>{t("rating.teamOfTheWeek")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ratings" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{t("rating.playerRatings")}</span>
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {adjustedRatingsCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Edit3 className="h-4 w-4 text-orange-600" />
                    <span>{adjustedRatingsCount} adjusted</span>
                  </div>
                )}
                {canApprove && (
                  <p>{t("rating.approveToConfirm")}</p>
                )}
              </div>
            </div>

            {/* Pending Ratings */}
            {pendingPlayerRatings.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">
                  {t("rating.pendingApproval")} ({pendingPlayerRatings.length})
                </h4>
                {pendingPlayerRatings.map((playerRating) => (
                  <EnhancedPlayerRating
                    key={playerRating.player_id}
                    playerRating={playerRating}
                    canApprove={canApprove}
                    onApprove={(adjustedFpl, adjustedParticipation) => 
                      handleApproveRating(playerRating, adjustedFpl, adjustedParticipation)
                    }
                    isApproving={approveMutation.isPending}
                  />
                ))}
              </div>
            )}

            {/* Approved Ratings */}
            {approvedPlayerRatings.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-green-700">
                  {t("rating.approved")} ({approvedPlayerRatings.length})
                </h4>
                {approvedPlayerRatings.map((playerRating) => (
                  <EnhancedPlayerRating
                    key={playerRating.player_id}
                    playerRating={playerRating}
                    approvedRating={approvedMap.get(playerRating.player_id)}
                    canApprove={false}
                    onApprove={() => {}}
                    isApproving={false}
                  />
                ))}
              </div>
            )}

            {(!hybridRatings || hybridRatings.length === 0) && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {t("rating.noPlayersToRate")}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">
                {t("rating.teamOfTheWeek")}
              </h3>
              <span className="text-sm text-muted-foreground">
                (7-a-side League)
              </span>
            </div>

            <TeamOfTheWeekDisplay 
              teamOfTheWeek={teamOfTheWeek} 
              captainOfTheWeek={captainOfTheWeek}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamOfTheWeek;
