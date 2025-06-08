
import React, { useEffect } from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import LiveScoreHeader from "./LiveScoreHeader";
import SimplifiedQuickGoalSection from "./SimplifiedQuickGoalSection";
import GoalsSummary from "./GoalsSummary";
import MatchControlsSection from "./MatchControlsSection";
import GoalMerger from "./GoalMerger";
import UnassignedGoalsDetector from "./UnassignedGoalsDetector";
import QuickGoalActions from "./QuickGoalActions";
import DetailedGoalActions from "./DetailedGoalActions";
import GoalWizardManager from "./GoalWizardManager";
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
                    <GoalWizardManager
                      selectedFixtureData={selectedFixtureData}
                      homeTeamPlayers={homeTeamPlayers}
                      awayTeamPlayers={awayTeamPlayers}
                      matchTime={matchTime}
                      formatTime={formatTime}
                      unassignedGoals={unassignedGoals}
                      forceRefresh={forceRefresh}
                      onWizardGoalComplete={async (goalData) => {
                        await handleWizardGoalAssigned(goalData);
                        
                        // Additional UI refresh after wizard completion
                        setTimeout(() => {
                          triggerUIUpdate();
                          console.log('🔄 ScoreTabContainer: Post-wizard UI refresh triggered');
                        }, 150);
                      }}
                    >
                      {({
                        showDetailedEntry,
                        handleFullGoalEntry,
                        handleAddDetailsToGoals
                      }) => {
                        if (showDetailedEntry) {
                          return null; // GoalWizardManager handles the wizard rendering
                        }

                        return (
                          <div className="space-y-6">
                            <LiveScoreHeader
                              homeTeamName={homeTeamName}
                              awayTeamName={awayTeamName}
                              matchTime={matchTime}
                              isRunning={isRunning}
                              formatTime={formatTime}
                            />

                            <SimplifiedQuickGoalSection
                              unassignedGoalsCount={unassignedGoalsCount}
                              isProcessingQuickGoal={isProcessingQuickGoal}
                              onQuickGoal={() => handleQuickGoal('home')}
                              onFullGoalEntry={handleFullGoalEntry}
                              onAddDetailsToGoals={handleAddDetailsToGoals}
                            />

                            <GoalsSummary goals={mergedGoals} formatTime={formatTime} />

                            <MatchControlsSection
                              isRunning={isRunning}
                              onToggleTimer={onToggleTimer}
                              onSaveMatch={onSaveMatch}
                              onResetMatch={onResetMatch}
                            />
                          </div>
                        );
                      }}
                    </GoalWizardManager>
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
