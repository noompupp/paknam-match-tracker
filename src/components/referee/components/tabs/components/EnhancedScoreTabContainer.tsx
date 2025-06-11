
import React from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { useEnhancedAutoSave } from "@/hooks/useEnhancedAutoSave";
import ScoreTabDisplay from "./ScoreTabDisplay";
import UnsavedChangesIndicator from "./UnsavedChangesIndicator";
import SimplifiedGoalRecording from "./SimplifiedGoalRecording";
import EnhancedGoalsSummary from "./EnhancedGoalsSummary";

interface EnhancedScoreTabContainerProps {
  selectedFixtureData: any;
  isRunning: boolean;
  matchTime: number;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
  onShowWizard: () => void;
}

const EnhancedScoreTabContainer = ({
  selectedFixtureData,
  isRunning,
  matchTime,
  homeTeamPlayers,
  awayTeamPlayers,
  formatTime,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
  onAssignGoal,
  forceRefresh,
  onShowWizard
}: EnhancedScoreTabContainerProps) => {
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';
  const homeTeamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id;
  const awayTeamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id;

  // Use global match store
  const {
    fixtureId,
    homeScore,
    awayScore,
    goals,
    hasUnsavedChanges,
    setFixtureId,
    addGoal,
    resetState,
    removeGoal,
    undoGoal
  } = useMatchStore();

  // Set fixture ID when component mounts or fixture changes
  React.useEffect(() => {
    if (selectedFixtureData?.id && fixtureId !== selectedFixtureData.id) {
      setFixtureId(selectedFixtureData.id);
    }
  }, [selectedFixtureData?.id, fixtureId, setFixtureId]);

  // Global batch save manager
  const { batchSave, unsavedItemsCount } = useGlobalBatchSaveManager({
    homeTeamData: { id: homeTeamId, name: homeTeamName },
    awayTeamData: { id: awayTeamId, name: awayTeamName }
  });

  // Enhanced auto-save functionality (5 minutes)
  useEnhancedAutoSave({
    enabled: true,
    onAutoSave: batchSave,
    interval: 5 * 60 * 1000, // 5 minutes
    hasUnsavedChanges,
    tabName: 'Score'
  });

  console.log('📊 Enhanced ScoreTabContainer: Advanced workflow with autosave:', { 
    fixtureId,
    homeScore, 
    awayScore, 
    goalsCount: goals.length,
    hasUnsavedChanges,
    unsavedItemsCount
  });

  const handleRecordGoal = () => {
    console.log('🎯 Enhanced ScoreTabContainer: Opening goal entry wizard');
    onShowWizard();
  };

  const handleSaveMatch = async () => {
    console.log('💾 Enhanced ScoreTabContainer: Save match triggered');
    await batchSave();
    onSaveMatch();
  };

  const handleResetMatch = () => {
    const confirmed = window.confirm(
      '⚠️ RESET MATCH DATA\n\n' +
      'This will reset all local match data and the database.\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you sure you want to proceed?'
    );

    if (confirmed) {
      resetState();
      onResetMatch();
    }
  };

  const handleRemoveGoal = (goalId: string) => {
    if (removeGoal) {
      removeGoal(goalId);
    }
  };

  const handleUndoGoal = (goalId: string) => {
    if (undoGoal) {
      undoGoal(goalId);
    }
  };

  return (
    <div className="space-y-6">
      <ScoreTabDisplay
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        isRunning={isRunning}
        hasUnsavedChanges={hasUnsavedChanges}
        formatTime={formatTime}
      />

      {goals.length > 0 && (
        <EnhancedGoalsSummary 
          goals={goals} 
          formatTime={formatTime}
          onRemoveGoal={handleRemoveGoal}
          onUndoGoal={handleUndoGoal}
        />
      )}

      <SimplifiedGoalRecording
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onRecordGoal={handleRecordGoal}
        isDisabled={false}
      />

      <UnsavedChangesIndicator
        hasUnsavedChanges={hasUnsavedChanges}
        unsavedItemsCount={unsavedItemsCount}
        onSave={handleSaveMatch}
      />

      {/* Note: Match Controls section removed as per plan */}
    </div>
  );
};

export default EnhancedScoreTabContainer;
