
import React from "react";
import { useLatestCompleteFixtures } from "@/hooks/useLatestCompleteFixtures";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star, StarOff } from "lucide-react";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

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
          className="p-1 rounded transition hover:bg-accent/40"
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
  const [ratings, setRatings] = React.useState<{ [playerId: string]: number }>({});

  // Defensive + DEBUG: Log raw data/result/fixture
  React.useEffect(() => {
    if (isLoading) console.log("[TeamOfTheWeek] Loading fixtures...");
    if (error)  console.error("[TeamOfTheWeek] Error loading fixtures", error);
    if (data) {
      console.log("[TeamOfTheWeek] Received fixtures data", data);
    }
  }, [isLoading, error, data]);

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
        {fixtures.map((fixture) => {
          // Defensive: log fixture (debug)
          if (!fixture || typeof fixture !== "object") {
            console.warn("[TeamOfTheWeek] Skipping invalid fixture:", fixture);
            return null;
          }
          return (
            <Card key={fixture.id} className="mb-6 w-full">
              <CardContent className="py-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-primary">
                    {/* Defensive team display */}
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
                    <ul className="ml-4 mt-1 list-disc text-muted-foreground text-sm">
                      {(fixture.goalEvents || []).map((event: any, idx: number) => {
                        if (
                          !event ||
                          typeof event !== "object" ||
                          typeof event.id !== "number" ||
                          isNaN(event.id)
                        ) {
                          console.warn("[TeamOfTheWeek] Skipping invalid goal event:", event);
                          return null;
                        }
                        // DEBUG event
                        console.log("[TeamOfTheWeek] Valid goal event:", event);

                        return (
                          <li key={event.id}>
                            <span className="font-medium">{event.player_name}</span> ({event.team_id}),
                            <span className="text-xs ml-1">
                              {event.event_type === "goal" ? t("rating.goal") : t("rating.assist")}
                            </span>
                            <StarRating
                              value={ratings[event.player_name] ?? 0}
                              onChange={v => setRatings(r => ({ ...r, [event.player_name]: v }))}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-2" disabled>
                    {t("rating.submitRatings")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TeamOfTheWeek;
