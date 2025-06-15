import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
// Translation
import { useTranslation } from "@/hooks/useTranslation";
import { useMatchStore } from "@/stores/useMatchStore";

interface UnifiedMatchTimerProps {
  selectedFixtureData: any;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  phase?: 'first' | 'second' | 'overtime';
}

const UnifiedMatchTimer = ({
  selectedFixtureData,
  matchTime,
  isRunning,
  formatTime,
  onToggleTimer,
  onResetMatch,
  phase = 'first'
}: UnifiedMatchTimerProps) => {
  const isMobile = useIsMobile();
  const { t, language } = useTranslation();

  // ALWAYS subscribe directly to the live store for scores/team names/etc.
  const {
    homeScore,
    awayScore,
    homeTeamName,
    awayTeamName,
    goals,
    hasUnsavedChanges,
    lastUpdated
  } = useMatchStore();

  // Always re-render on lastUpdated
  React.useEffect(() => { /* pointless effect so batching never skips updates */ }, [lastUpdated]);

  // Debug every render with team names and scores
  console.log('[UnifiedMatchTimer v2] Current ZUSTAND STATE:', {
    homeScore, awayScore, homeTeamName, awayTeamName, goals, hasUnsavedChanges, lastUpdated, matchTime
  });

  if (selectedFixtureData) {
    console.log('[UnifiedMatchTimer] 🔎 Fixture data team names:', {
      fixtureHome: selectedFixtureData.home_team?.name,
      fixtureAway: selectedFixtureData.away_team?.name,
      storeHome: homeTeamName,
      storeAway: awayTeamName
    });
  }

  const HALF_DURATION = 25 * 60; // 25 minutes in seconds
  const currentPhaseTime = phase === 'second' && matchTime > HALF_DURATION 
    ? matchTime - HALF_DURATION 
    : matchTime;

  const getPhaseDisplay = () => {
    if (matchTime <= HALF_DURATION) return t("referee.phase.firstHalf", "First Half");
    if (matchTime <= HALF_DURATION * 2) return t("referee.phase.secondHalf", "Second Half");
    return t("referee.phase.overtime", "Overtime");
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'first': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'second': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'overtime': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  let timerButtonLabel = "";
  if (isRunning) {
    timerButtonLabel = t("referee.timer.pause", "Pause Timer");
  } else if (matchTime === 0) {
    timerButtonLabel = t("referee.timer.start", "Start Timer");
  } else {
    timerButtonLabel = t("referee.timer.resume", "Resume Timer");
  }

  const statusBadgeLabel = isRunning
    ? t("referee.status.live", "LIVE")
    : t("referee.status.paused", "PAUSED");

  const dateFormatter = language === "th"
    ? (d: string) => new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
    : (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <Card className="card-shadow-lg border-l-4 border-l-primary">
      <CardContent className="pt-4">
        {/* Match Info Header */}
        {selectedFixtureData && (
          <div className="text-center mb-3">
            <div className="text-sm text-muted-foreground mb-1">
              {dateFormatter(selectedFixtureData.match_date)} • {selectedFixtureData.match_time}
            </div>
            <div className="text-xs text-muted-foreground">
              {/* Always use live store team names */}
              {(homeTeamName || selectedFixtureData.home_team?.name || t("referee.homeTeam"))} {t("referee.matchTeamsVs.connector", "vs")} {(awayTeamName || selectedFixtureData.away_team?.name || t("referee.awayTeam"))}
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {selectedFixtureData ? (
            <>
              {/* Home Team */}
              <div className="text-center min-w-0 flex-1">
                <div className="text-sm font-medium text-muted-foreground truncate">
                  {homeTeamName || selectedFixtureData.home_team?.name || t("referee.homeTeam")}
                </div>
                <div className="text-3xl font-bold text-primary">{homeScore}</div>
              </div>

              {/* Timer Center */}
              <div className="text-center px-4">
                <div className="flex flex-col items-center gap-2">
                  {/* Phase Indicator */}
                  <Badge className={cn("text-xs font-medium", getPhaseColor())}>
                    {getPhaseDisplay()}
                  </Badge>
                  <div className="text-4xl font-bold mb-1">{formatTime(matchTime)}</div>
                  <Badge variant={isRunning ? "default" : "secondary"} className="text-xs">
                    <Timer className="h-3 w-3 mr-1" />
                    {statusBadgeLabel}
                  </Badge>
                </div>
              </div>

              {/* Away Team */}
              <div className="text-center min-w-0 flex-1">
                <div className="text-sm font-medium text-muted-foreground truncate">
                  {awayTeamName || selectedFixtureData.away_team?.name || t("referee.awayTeam")}
                </div>
                <div className="text-3xl font-bold text-primary">{awayScore}</div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{formatTime(matchTime)}</div>
              <Badge variant={isRunning ? "default" : "secondary"}>
                <Timer className="h-3 w-3 mr-1" />
                {statusBadgeLabel}
              </Badge>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={cn("flex gap-3", isMobile ? "flex-col" : "justify-center")}>
          <Button
            onClick={onToggleTimer}
            className={cn(
              isMobile ? "w-full" : "",
              "flex items-center gap-2"
            )}
            size={isMobile ? "lg" : "default"}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {timerButtonLabel}
          </Button>
          <Button
            onClick={onResetMatch}
            variant="outline"
            className={cn(
              isMobile ? "w-full" : "",
              "flex items-center gap-2"
            )}
            size={isMobile ? "lg" : "default"}
          >
            <RotateCcw className="h-4 w-4" />
            {t("referee.reset", "Reset Match")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedMatchTimer;
