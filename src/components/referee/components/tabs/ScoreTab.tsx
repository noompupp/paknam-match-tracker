
import React, { useState } from "react";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import GoalEntryWizard from "../GoalEntryWizard";
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { useAutoSave } from "@/hooks/useAutoSave";
import ScoreTabDisplay from "./components/ScoreTabDisplay";
import ScoreTabEventHandlers from "./components/ScoreTabEventHandlers";
import ScoreTabModals from "./components/ScoreTabModals";
import UnsavedChangesIndicator from "./components/UnsavedChangesIndicator";
import SimplifiedQuickGoalSection from "./components/SimplifiedQuickGoalSection";
import GoalsSummary from "./components/GoalsSummary";
import MatchControlsSection from "./components/MatchControlsSection";

interface ScoreTabProps {
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
}

interface QuickGoal {
  id: number | string;
  event_time?: number;
  time?: number;
  team_id?: string;
  teamId?: string;
  teamName?: string;
  team?: 'home' | 'away';
  description?: string;
  created_at?: string;
  playerName?: string;
}

const ScoreTab = ({
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
  forceRefresh
}: ScoreTabProps) => {
  const [showWizard, setShowWizard] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [showQuickGoalSelection, setShowQuickGoalSelection] = useState(false);
  const [editingGoal, setEditingGoal] = useState<QuickGoal | null>(null);
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);

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
    addAssist,
    addEvent,
    resetState,
    getUnassignedGoalsCount
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

  const unassignedGoalsCount = getUnassignedGoalsCount();

  console.log('📊 ScoreTab: Using global store:', { 
    fixtureId,
    homeScore, 
    awayScore, 
    goalsCount: goals.length,
    unassignedGoalsCount,
    hasUnsavedChanges,
    unsavedItemsCount
  });

  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => {
    console.log('🎯 ScoreTab: Goal assigned via wizard:', goalData);
    
    const teamId = goalData.team === 'home' ? homeTeamId : awayTeamId;
    const teamName = goalData.team === 'home' ? homeTeamName : awayTeamName;

    if (goalData.isEdit) {
      console.log('✏️ ScoreTab: Edit mode detected, delegating to DetailedGoalHandler');
    } else {
      addGoal({
        playerId: goalData.player.id,
        playerName: goalData.player.name,
        team: goalData.team,
        teamId,
        teamName,
        type: 'goal',
        time: matchTime,
        isOwnGoal: goalData.isOwnGoal
      });

      if (goalData.assistPlayer && !goalData.isOwnGoal) {
        addAssist({
          playerId: goalData.assistPlayer.id,
          playerName: goalData.assistPlayer.name,
          team: goalData.team,
          teamId,
          teamName,
          type: 'assist',
          time: matchTime
        });
      }

      addEvent('Goal Assignment', `Goal assigned to ${goalData.player.name}`, matchTime);
    }
    
    setShowWizard(false);
    setEditingGoal(null);
  };

  const handleSaveMatch = async () => {
    console.log('💾 ScoreTab: Save match triggered');
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

  if (showWizard) {
    return (
      <div className="space-y-6">
        <GoalEntryWizard
          selectedFixtureData={selectedFixtureData}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          matchTime={matchTime}
          formatTime={formatTime}
          onGoalAssigned={handleWizardGoalAssigned}
          onCancel={() => {
            setShowWizard(false);
            setEditingGoal(null);
          }}
          editingGoal={editingGoal || undefined}
        />
      </div>
    );
  }

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
        <GoalsSummary goals={goals} formatTime={formatTime} />
      )}

      <ScoreTabEventHandlers
        selectedFixtureData={selectedFixtureData}
        matchTime={matchTime}
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        unassignedGoalsCount={unassignedGoalsCount}
        isProcessingQuickGoal={isProcessingQuickGoal}
        setIsProcessingQuickGoal={setIsProcessingQuickGoal}
        setShowTeamSelection={setShowTeamSelection}
        setShowQuickGoalSelection={setShowQuickGoalSelection}
        setEditingGoal={setEditingGoal}
        setShowWizard={setShowWizard}
      >
        {({
          handleQuickGoalClick,
          handleFullGoalEntryClick,
          handleAddDetailsToGoalsClick,
          handleTeamSelected,
          handleQuickGoalSelected
        }) => (
          <>
            <SimplifiedQuickGoalSection
              unassignedGoalsCount={unassignedGoalsCount}
              isProcessingQuickGoal={isProcessingQuickGoal}
              onQuickGoal={handleQuickGoalClick}
              onFullGoalEntry={handleFullGoalEntryClick}
              onAddDetailsToGoals={handleAddDetailsToGoalsClick}
            />

            <ScoreTabModals
              showTeamSelection={showTeamSelection}
              showQuickGoalSelection={showQuickGoalSelection}
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
              goals={goals}
              formatTime={formatTime}
              onCloseTeamSelection={() => setShowTeamSelection(false)}
              onCloseQuickGoalSelection={() => setShowQuickGoalSelection(false)}
              onTeamSelected={handleTeamSelected}
              onQuickGoalSelected={handleQuickGoalSelected}
            />
          </>
        )}
      </ScoreTabEventHandlers>

      <UnsavedChangesIndicator
        hasUnsavedChanges={hasUnsavedChanges}
        unsavedItemsCount={unsavedItemsCount}
        onSave={handleSaveMatch}
      />

      <MatchControlsSection
        isRunning={isRunning}
        onToggleTimer={onToggleTimer}
        onSaveMatch={handleSaveMatch}
        onResetMatch={handleResetMatch}
      />
    </div>
  );
};

export default ScoreTab;
