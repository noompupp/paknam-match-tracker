import React from "react";
import { useLatestCompleteFixtures } from "@/hooks/useLatestCompleteFixtures";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star, StarOff } from "lucide-react";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { usePlayerRatings, useSubmitPlayerRating, PlayerRating } from "@/hooks/usePlayerRatings";
import { useToast } from "@/hooks/use-toast";

// Enhanced StarRating with debug/info
const StarRating = ({
  value,
  onChange,
  max = 5,
  disabled = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  disabled?: boolean;
}) => {
  // DEBUG for rating star rendering
  React.useEffect(() => {
    if (typeof value !== 'number' || value < 0) {
      console.warn("StarRating: Invalid value prop", value);
    }
  }, [value]);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <button
          type="button"
          key={i}
          className="p-1 rounded transition hover:bg-accent/40 disabled:cursor-not-allowed"
          onClick={() => !disabled && onChange?.(i + 1)}
          disabled={disabled}
          tabIndex={-1}
        >
          {value > i ? (
            <Star className="text-yellow-500 fill-yellow-400 w-5 h-5" />
          ) : (
            <StarOff className="text-gray-300 w-5 h-5" />
          )}
        </button>
      ))}
    </div>
  );
};

const TeamOfTheWeek: React.FC = () => {
  const { data, isLoading, error } = useLatestCompleteFixtures();
  const { t } = useTranslation();
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [localRatings, setLocalRatings] = React.useState<{ [k: string]: number }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);

  // Currently only supporting one fixture (most recent), could be expanded
  const fixture = (data && data.length > 0) ? data[0] : null;

  // Preload ratings for this fixture for the current user
  const {
    data: userRatings,
    isLoading: ratingsLoading,
    error: ratingsError,
    refetch: refetchRatings,
  } = usePlayerRatings(fixture?.id || null);

  // Type helper: Ensures that a value is a PlayerRating object
  function isPlayerRating(obj: unknown): obj is PlayerRating {
    if (!obj || typeof obj !== "object") return false;
    // 'player_id' and 'rating' are the fields we care about
    return (
      "player_id" in obj &&
      typeof (obj as any).player_id === "number" &&
      "rating" in obj &&
      typeof (obj as any).rating === "number"
    );
  }

  const submitMutation = useSubmitPlayerRating();

  React.useEffect(() => {
    if (Array.isArray(userRatings)) {
      // Pre-fill localRatings with user's submitted ratings for players in this fixture
      const nextRatings: { [k: string]: number } = {};
      for (const r of userRatings) {
        if (isPlayerRating(r)) {
          nextRatings[String(r.player_id)] = r.rating;
        }
      }
      setLocalRatings((prev) => ({ ...nextRatings, ...prev }));
    }
  }, [userRatings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="font-semibold text-destructive mb-2">{t("common.error")}:</p>
        <p>{String((error as any).message || error)}</p>
      </div>
    );
  }

  // Defensive: filter only fixtures with valid integer id!
  const fixtures = (data ?? []).filter(
    (fixture: any) => typeof fixture.id === "number" && !isNaN(fixture.id)
  );
  if ((data && fixtures.length === 0) || (!data && !isLoading)) {
    console.warn("[TeamOfTheWeek] No valid fixtures found, check source data:", data);
  }

  // Preprocess goal events for playerId lookup and team validation
  function getGoalPlayersWithId(goalEvents: any[]): Array<{ player_name: string; team_id: string; player_id: number; event_type: string; }> {
    // Only events with player_id are ratable
    return (goalEvents || [])
      .filter(event => event && typeof event.player_id === "number" && event.player_id > 0)
      .map(event => ({
        player_name: event.player_name,
        team_id: event.team_id,
        player_id: event.player_id,
        event_type: event.event_type,
      }));
  }

  // Find user's team for access control
  function getUserTeamId(): string | null {
    if (!user) return null;
    // Heuristic: Check user.email matches a member record (needs improved mapping)
    // For real implementation, fetch user profile or member record by user.uid or email
    // Here, fallback to null (admin can always rate)
    return null;
  }

  // Prevent rating from user's own team
  function canRatePlayer(playerTeamId: string): boolean {
    // For now, always return true (RLS will block backend if user is not permitted)
    // If fetching user's own team data, implement check here!
    return true;
  }

  // Submit ALL ratings for this fixture
  async function handleSubmitAllRatings() {
    if (!fixture) return;
    setHasAttemptedSubmit(true);
    if (!user) {
      toast({
        title: t("common.error"),
        description: t("message.signInRequired"),
        variant: "destructive",
      });
      return;
    }
    const ratablePlayers = getGoalPlayersWithId(fixture.goalEvents || []);
    // Only submit ratings for players we changed or have not submitted yet
    const toSubmit = ratablePlayers.filter(
      (p) => {
        const score = localRatings[p.player_id];
        // allow only valid ratings 1-5
        return typeof score === "number" && score >= 1 && score <= 5;
      }
    );
    if (toSubmit.length === 0) {
      toast({
        title: t("common.error"),
        description: t("rating.noRatingsSelected") || "Please rate at least one player before submitting.",
        variant: "destructive",
      });
      return;
    }
    // Submit ratings one by one (supabase.upsert allows batch, but let's keep simple)
    for (const p of toSubmit) {
      try {
        await submitMutation.mutateAsync({
          fixtureId: fixture.id,
          playerId: p.player_id,
          rating: localRatings[p.player_id],
        });
      } catch (err) {
        toast({
          title: t("common.error"),
          description: (err as any)?.message ?? "Failed to submit rating.",
          variant: "destructive",
        });
      }
    }
    toast({
      title: t("rating.submitRatings"),
      description: t("rating.submissionSuccess") || "Your ratings have been submitted.",
      variant: "default",
    });
    refetchRatings();
  }

  return (
    <div className="gradient-bg min-h-screen">
      <UnifiedPageHeader
        title={t("nav.rating") || "Team of the Week"}
        logoSize="medium"
        showLanguageToggle={true}
      />
      <div className="max-w-2xl mx-auto py-6 px-2 sm:px-6 flex flex-col gap-8">
        <h2 className="text-lg sm:text-2xl font-bold text-center mt-4 mb-2">
          {t("rating.heading")}
        </h2>
        {fixtures.length === 0 && (
          <p className="text-center text-muted-foreground">
            {t("rating.noMatches")}
          </p>
        )}
        {fixtures.map((fixture) => (
          <Card key={fixture.id} className="mb-6 w-full">
            <CardContent className="py-5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-primary">
                  {fixture.team1 || fixture.home_team_id || "???"} vs{" "}
                  {fixture.team2 || fixture.away_team_id || "???"}
                </span>
                <span className="font-mono text-lg">
                  <span className="text-foreground">{fixture.home_score ?? "?"}</span>{" "}
                  <span className="font-thin text-muted-foreground">-</span>{" "}
                  <span className="text-foreground">{fixture.away_score ?? "?"}</span>
                </span>
              </div>
              <div>
                <div className="mb-2">
                  <span className="font-semibold">{t("rating.goalScorers")}:</span>
                  {/* Ratings list: group by player, show rating + allow edit */}
                  <ul className="ml-4 mt-1 list-disc text-muted-foreground text-sm">
                    {getGoalPlayersWithId(fixture.goalEvents || []).map((player) => (
                      <li key={player.player_id} className="mb-2 flex flex-row items-center gap-2">
                        <span className="font-medium">{player.player_name}</span> ({player.team_id}),
                        <span className="text-xs ml-1">
                          {player.event_type === "goal"
                            ? t("rating.goal")
                            : t("rating.assist")}
                        </span>
                        <span className="ml-3">
                          <StarRating
                            value={localRatings[player.player_id] ?? 0}
                            onChange={(v) =>
                              setLocalRatings((r) => ({
                                ...r,
                                [player.player_id]: v,
                              }))
                            }
                            disabled={submitMutation.isPending || !canRatePlayer(player.team_id)}
                          />
                        </span>
                        {/* Only show your rating if available and valid */}
                        {!!userRatings &&
                          (() => {
                            // Get the PlayerRating object if present
                            const found = Array.isArray(userRatings)
                              ? userRatings.find((r) => isPlayerRating(r) && r.player_id === player.player_id)
                              : undefined;
                            return found && isPlayerRating(found) && found.rating > 0 ? (
                              <span className="ml-2 text-green-700 font-medium">
                                {t("rating.yourRating")}: {found.rating}
                              </span>
                            ) : null;
                          })()}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={handleSubmitAllRatings}
                  disabled={submitMutation.isPending || !user}
                >
                  {submitMutation.isPending
                    ? t("rating.submitting") || "Submitting..."
                    : t("rating.submitRatings") || "Submit Ratings"}
                </Button>
                {!user && (
                  <p className="text-xs mt-2 text-muted-foreground">{t("message.signInRequired")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamOfTheWeek;
