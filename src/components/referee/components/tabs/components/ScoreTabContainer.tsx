
import React, { useEffect } from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import LiveScoreHeader from "./LiveScoreHeader";
import SimplifiedGoalRecording from "./SimplifiedGoalRecording";
import GoalsSummary from "./GoalsSummary";
import MatchControlsSection from "./MatchControlsSection";
import GoalMerger from "./GoalMerger";
import UnassignedGoalsDetector from "./UnassignedGoalsDetector";
import QuickGoalActions from "./QuickGoalActions";
import DetailedGoalActions from "./DetailedGoalActions";
import { useMatchStore } from "@/stores/useMatchStore";

interface ScoreTabContainerProps {
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
  isRunning: boolean;
  goals: any[];
  matchTime: number;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
}

const ScoreTabContainer = ({
  homeScore,
  awayScore,
  selectedFixtureData,
  isRunning,
  goals,
  matchTime,
  homeTeamPlayers,
  awayTeamPlayers,
  formatTime,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
  onAssignGoal,
  forceRefresh
}: ScoreTabContainerProps) => {
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  // Enhanced real-time store integration
  const { lastUpdated, triggerUIUpdate } = useMatchStore();

  // Auto-refresh effect when lastUpdated changes
  useEffect(() => {
    console.log('🔄 ScoreTabContainer: Auto-refresh triggered by lastUpdated:', lastUpdated);
  }, [lastUpdated]);

  const handleRecordGoal = () => {
    console.log('🎯 ScoreTabContainer: Record goal clicked - simplified workflow');
    // This would trigger the goal entry wizard
  };

  return (
    <GoalMerger goals={goals}>
      {({ mergedGoals }) => (
        <UnassignedGoalsDetector mergedGoals={mergedGoals} lastUpdated={lastUpdated}>
          {({ unassignedGoals, unassignedGoalsCount }) => (
            <QuickGoalActions
              selectedFixtureData={selectedFixtureData}
              matchTime={matchTime}
              formatTime={formatTime}
              forceRefresh={forceRefresh}
              onSaveMatch={onSaveMatch}
            >
              {({ isProcessingQuickGoal, handleQuickGoal }) => (
                <DetailedGoalActions
                  selectedFixtureData={selectedFixtureData}
                  forceRefresh={forceRefresh}
                  onAssignGoal={onAssignGoal}
                >
                  {({ handleWizardGoalAssigned }) => (
                    <div className="space-y-6">
                      <LiveScoreHeader
                        homeTeamName={homeTeamName}
                        awayTeamName={awayTeamName}
                        matchTime={matchTime}
                        isRunning={isRunning}
                        formatTime={formatTime}
                      />

                      <SimplifiedGoalRecording
                        homeTeamName={homeTeamName}
                        awayTeamName={awayTeamName}
                        onRecordGoal={handleRecordGoal}
                        isDisabled={false}
                      />

                      <GoalsSummary goals={mergedGoals} formatTime={formatTime} />

                      <MatchControlsSection
                        isRunning={isRunning}
                        onToggleTimer={onToggleTimer}
                        onSaveMatch={onSaveMatch}
                        onResetMatch={onResetMatch}
                      />
                    </div>
                  )}
                </DetailedGoalActions>
              )}
            </QuickGoalActions>
          )}
        </UnassignedGoalsDetector>
      )}
    </GoalMerger>
  );
};

export default ScoreTabContainer;
