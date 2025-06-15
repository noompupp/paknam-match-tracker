
import React from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { useAutoSync } from "@/hooks/useAutoSync";
import ScoreTabGoalsSummarySection from "./ScoreTabGoalsSummarySection";
import ScoreTabGoalRecordingSection from "./ScoreTabGoalRecordingSection";
import ScoreTabUnsavedChangesSection from "./ScoreTabUnsavedChangesSection";
import ScoreTabMatchControlsSection from "./ScoreTabMatchControlsSection";
import SyncStatusIndicator from "@/components/shared/SyncStatusIndicator";
import { useToast } from "@/hooks/use-toast";

interface ScoreTabContainerProps {
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

const ScoreTabContainer = ({
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
}: ScoreTabContainerProps) => {
  const {
    fixtureId,
    homeScore,
    awayScore,
    goals,
    hasUnsavedChanges,
    setFixtureId,
    setupMatch,
    addGoal,
    addAssist,
    addEvent,
    resetState,
    homeTeamName,
    awayTeamName,
    homeTeamId,
    awayTeamId,
    syncToDatabase,
    isAutoSyncEnabled,
    isSyncing
  } = useMatchStore();

  // Set fixture ID and team names when component mounts or fixture changes
  React.useEffect(() => {
    if (
      selectedFixtureData?.id && (
        fixtureId !== selectedFixtureData.id ||
        homeTeamName !== useMatchStore.getState().homeTeamName ||
        awayTeamName !== useMatchStore.getState().awayTeamName
      )
    ) {
      setupMatch({
        fixtureId: selectedFixtureData.id,
        homeTeamName: selectedFixtureData.home_team?.name || homeTeamName,
        awayTeamName: selectedFixtureData.away_team?.name || awayTeamName,
        homeTeamId: selectedFixtureData.home_team_id || homeTeamId,
        awayTeamId: selectedFixtureData.away_team_id || awayTeamId
      });
      setFixtureId(selectedFixtureData.id);
      console.log("[ScoreTabContainer] setupMatch called with auto-sync enabled");
    }
  }, [selectedFixtureData?.id, homeTeamName, awayTeamName, homeTeamId, awayTeamId, fixtureId, setupMatch, setFixtureId]);

  // Global batch save manager
  const { batchSave, unsavedItemsCount } = useGlobalBatchSaveManager({
    homeTeamData: { id: homeTeamId, name: homeTeamName },
    awayTeamData: { id: awayTeamId, name: awayTeamName }
  });

  // Auto-sync functionality with enhanced database sync
  useAutoSync({
    enabled: isAutoSyncEnabled,
    onAutoSave: async () => {
      console.log('🔄 Auto-sync triggered - syncing to database');
      await syncToDatabase();
    },
    interval: 3000, // 3 seconds for faster sync
    hasUnsavedChanges
  });

  console.log('📊 ScoreTabContainer: Enhanced auto-sync workflow active:', { 
    fixtureId,
    homeScore, 
    awayScore, 
    goalsCount: goals.length,
    hasUnsavedChanges,
    unsavedItemsCount,
    isAutoSyncEnabled,
    isSyncing
  });

  const { toast } = useToast();

  // Show enhanced sync status notifications
  React.useEffect(() => {
    if (hasUnsavedChanges && !isSyncing && !isAutoSyncEnabled) {
      toast({
        title: "Manual Save Required",
        description: "Auto-sync is disabled. Changes need to be saved manually.",
        variant: "destructive"
      });
    }
  }, [hasUnsavedChanges, isSyncing, isAutoSyncEnabled, toast]);

  const handleRecordGoal = () => {
    console.log('🎯 ScoreTabContainer: Opening goal entry wizard');
    onShowWizard();
  };

  const handleSaveMatch = async () => {
    console.log('💾 ScoreTabContainer: Manual save triggered');
    try {
      await syncToDatabase();
      await batchSave();
      onSaveMatch();
      toast({
        title: "Match Data Saved",
        description: "All changes have been synced to the database successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save match data to database. Please try again.",
        variant: "destructive"
      });
    }
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

  return (
    <div className="space-y-6">
      {/* Enhanced Sync Status */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Sync Status:</span>
          <SyncStatusIndicator showDetails={true} />
        </div>
        {!isAutoSyncEnabled && (
          <span className="text-xs text-muted-foreground">
            Auto-sync disabled - manual saves required
          </span>
        )}
      </div>

      <ScoreTabGoalsSummarySection goals={goals} formatTime={formatTime} />
      <ScoreTabGoalRecordingSection
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onRecordGoal={onShowWizard}
        isDisabled={isSyncing}
      />
      <ScoreTabUnsavedChangesSection
        hasUnsavedChanges={hasUnsavedChanges}
        unsavedItemsCount={unsavedItemsCount}
        onSave={handleSaveMatch}
      />
      <ScoreTabMatchControlsSection
        isRunning={isRunning}
        onToggleTimer={onToggleTimer}
        onSaveMatch={handleSaveMatch}
        onResetMatch={handleResetMatch}
      />
    </div>
  );
};

export default ScoreTabContainer;
