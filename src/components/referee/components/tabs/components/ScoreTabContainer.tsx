import React from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { useAutoSave } from "@/hooks/useAutoSave";
import ScoreTabGoalsSummarySection from "./ScoreTabGoalsSummarySection";
import ScoreTabGoalRecordingSection from "./ScoreTabGoalRecordingSection";
import ScoreTabUnsavedChangesSection from "./ScoreTabUnsavedChangesSection";
import ScoreTabMatchControlsSection from "./ScoreTabMatchControlsSection";
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
  // Use match store as single source of truth for homeScore/awayScore
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
    resetState
  } = useMatchStore();

  // Set fixture ID and team names when component mounts or fixture changes
  React.useEffect(() => {
    if (selectedFixtureData?.id && (
          fixtureId !== selectedFixtureData.id ||
          homeTeamName !== (useMatchStore.getState().homeTeamName) ||
          awayTeamName !== (useMatchStore.getState().awayTeamName)
       )
    ) {
      setupMatch({
        fixtureId: selectedFixtureData.id,
        homeTeamName: homeTeamName,
        awayTeamName: awayTeamName,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId
      });
      setFixtureId(selectedFixtureData.id); // In case any legacy code needs it
      console.log("[ScoreTabContainer] setupMatch called", {
        fixtureId: selectedFixtureData.id,
        homeTeamName,
        awayTeamName,
        homeTeamId,
        awayTeamId,
      });
    }
  }, [selectedFixtureData?.id, homeTeamName, awayTeamName, homeTeamId, awayTeamId, fixtureId, setupMatch, setFixtureId]);

  // Global batch save manager
  const { batchSave, unsavedItemsCount } = useGlobalBatchSaveManager({
    homeTeamData: { id: homeTeamId, name: homeTeamName },
    awayTeamData: { id: awayTeamId, name: awayTeamName }
  });

  // Auto-save functionality
  useAutoSave({
    enabled: true,
    onAutoSave: batchSave,
    interval: 30000, // 30 seconds
    hasUnsavedChanges
  });

  console.log('📊 ScoreTabContainer: Simplified workflow active:', { 
    fixtureId,
    homeScore, 
    awayScore, 
    goalsCount: goals.length,
    hasUnsavedChanges,
    unsavedItemsCount
  });

  const { toast } = useToast();

  // Show yellow unsaved banner/toast logic
  React.useEffect(() => {
    if (hasUnsavedChanges && (unsavedItemsCount.goals > 0 || unsavedItemsCount.cards > 0 || unsavedItemsCount.playerTimes > 0)) {
      toast({
        title: "Unsaved Changes",
        description: "New goals, cards, or time entries need to be saved.",
        variant: "destructive"
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, unsavedItemsCount.goals, unsavedItemsCount.cards, unsavedItemsCount.playerTimes]);

  const handleRecordGoal = () => {
    console.log('🎯 ScoreTabContainer: Opening goal entry wizard');
    onShowWizard();
  };

  const handleSaveMatch = async () => {
    console.log('💾 ScoreTabContainer: Save match triggered');
    await batchSave();
    onSaveMatch();
    toast({
      title: "Score Data Saved",
      description: "All unsaved changes have been committed to the database. Scoreboard is up to date.",
      variant: "default"
    });
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
      <ScoreTabGoalsSummarySection goals={goals} formatTime={formatTime} />
      <ScoreTabGoalRecordingSection
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onRecordGoal={onShowWizard}
        isDisabled={false}
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
        onResetMatch={() => {
          if (window.confirm("⚠️ RESET MATCH DATA\n\nThis will reset all local match data and the database.\n\nThis action CANNOT be undone!\n\nAre you sure you want to proceed?")) {
            resetState();
            onResetMatch();
          }
        }}
      />
    </div>
  );
};

export default ScoreTabContainer;
