import { useToast } from "@/hooks/use-toast";
import { useMatchSaveStatus } from "../useMatchSaveStatus";
import { unifiedRefereeService } from "@/services/fixtures";
import { formatMatchSaveSuccessMessage } from "./formatMatchSaveSuccessMessage";
import { UseMatchDataHandlersProps } from "./types";
import { useCallback } from "react";
import { roundSecondsUpToMinute } from "@/utils/timeUtils";

export const useMatchSaveHandler = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  goals,
  playersForTimeTracker,
  matchTime,
  setSaveAttempts,
  addEvent,
  forceRefresh,
  resetState,
  cacheManager
}: UseMatchDataHandlersProps & { resetState: any; cacheManager: any }) => {
  const { toast } = useToast();
  const { setPhase, reset: resetSaveStatus } = useMatchSaveStatus();

  const handleSaveMatch = useCallback(async () => {
    if (!selectedFixtureData) return;

    setSaveAttempts((prev: number) => typeof prev === "number" ? prev + 1 : 1);

    try {
      setPhase("validating", { statusMessage: "Validating match data..." });
      console.log('💾 useMatchSaveHandler: Starting unified match save...');

      toast({
        title: "Saving Match...",
        description: "Please wait while we save your match data"
      });

      setPhase("saving", { statusMessage: "Saving match and player statistics...", progress: 20 });

      const matchData = {
        fixtureId: selectedFixtureData.id,
        homeScore,
        awayScore,
        goals: goals.map((goal: any) => ({
          playerId: goal.playerId,
          playerName: goal.playerName,
          team: goal.team,
          type: goal.type as 'goal' | 'assist',
          // Round up to next minute when saving DB event
          time: roundSecondsUpToMinute(goal.time),
          isOwnGoal: goal.isOwnGoal || false
        })),
        cards: [], // TODO: update if cards stored similarly
        playerTimes: playersForTimeTracker.map(player => ({
          playerId: player.id,
          playerName: player.name,
          team: player.team,
          totalTime: Math.floor(player.totalTime / 60),
          periods: [{
            start_time: player.startTime || 0,
            // Also round matchTime for saving
            end_time: roundSecondsUpToMinute(matchTime),
            duration: Math.floor(player.totalTime / 60)
          }]
        })),
        homeTeam: {
          id: selectedFixtureData.home_team_id,
          name: selectedFixtureData.home_team?.name
        },
        awayTeam: {
          id: selectedFixtureData.away_team_id,
          name: selectedFixtureData.away_team?.name
        }
      };

      setPhase("saving", { statusMessage: "Saving match to server ...", progress: 40 });

      const result = await unifiedRefereeService.saveCompleteMatchData(matchData);

      if (result.success) {
        setPhase("cache", { statusMessage: "Syncing cache...", progress: 70 });
        addEvent('Save', `Match saved successfully: ${result.message}`, matchTime);
        await cacheManager.invalidateMatchQueries(selectedFixtureData.id);

        resetState.clearResetState();

        if (forceRefresh) {
          setPhase("refreshing", { statusMessage: "Refreshing local data...", progress: 85 });
          await forceRefresh();
        }

        setPhase("success", { statusMessage: result.message, progress: 100 });
        setTimeout(resetSaveStatus, 1500);

        toast({
          title: "✅ Match Saved!",
          description: formatMatchSaveSuccessMessage(
            result,
            selectedFixtureData.home_team?.name ?? "Home",
            homeScore,
            selectedFixtureData.away_team?.name ?? "Away",
            awayScore
          )
        });
      } else {
        setPhase("error", {
          statusMessage: "Save completed with errors",
          errorMessage: (result.errors && result.errors[0]) || "Unknown error",
          progress: 100
        });
        toast({
          title: "Save Completed with Issues",
          description: formatMatchSaveSuccessMessage(
            result,
            selectedFixtureData.home_team?.name ?? "Home",
            homeScore,
            selectedFixtureData.away_team?.name ?? "Away",
            awayScore
          ),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setPhase("error", {
        statusMessage: "Critical save failure",
        errorMessage: error?.message || "Unknown error",
        progress: 100
      });
      console.error('❌ useMatchSaveHandler: Failed to save match:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save match. Please try again.",
        variant: "destructive"
      });
    }
  }, [
    selectedFixtureData, homeScore, awayScore, goals, playersForTimeTracker, matchTime,
    setSaveAttempts, addEvent, forceRefresh, setPhase, resetSaveStatus, resetState, cacheManager
  ]);

  return { handleSaveMatch };
};
