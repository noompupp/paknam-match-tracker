
import React from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { useAutoSave } from "@/hooks/useAutoSave";
import ScoreTabGoalsSummarySection from "./ScoreTabGoalsSummarySection";
import ScoreTabGoalRecordingSection from "./ScoreTabGoalRecordingSection";
import ScoreTabUnsavedChangesSection from "./ScoreTabUnsavedChangesSection";
import ScoreTabMatchControlsSection from "./ScoreTabMatchControlsSection";

// removed homeScore/awayScore props (use store)

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
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';
  const homeTeamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id;
  const awayTeamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id;

  // Use match store as single source of truth for homeScore/awayScore
  const {
    fixtureId,
    homeScore,
    awayScore,
    goals,
    hasUnsavedChanges,
    setFixtureId,
    addGoal,
    addAssist,
    addEvent,
    resetState
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

  const handleRecordGoal = () => {
    console.log('🎯 ScoreTabContainer: Opening goal entry wizard');
    onShowWizard();
  };

  const handleSaveMatch = async () => {
    console.log('💾 ScoreTabContainer: Save match triggered');
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
        onSave={async () => { await batchSave(); onSaveMatch(); }}
      />
      <ScoreTabMatchControlsSection
        isRunning={isRunning}
        onToggleTimer={onToggleTimer}
        onSaveMatch={async () => { await batchSave(); onSaveMatch(); }}
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
