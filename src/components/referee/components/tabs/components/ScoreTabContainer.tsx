
import React, { useState } from "react";
import GoalEntryWizard from "../../GoalEntryWizard";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import LiveScoreHeader from "./LiveScoreHeader";
import SimplifiedQuickGoalSection from "./SimplifiedQuickGoalSection";
import GoalsSummary from "./GoalsSummary";
import MatchControlsSection from "./MatchControlsSection";
import { useQuickGoalHandler } from "./QuickGoalHandler";
import { useDetailedGoalHandler } from "./DetailedGoalHandler";
import { useMatchStore } from "@/stores/useMatchStore";
import { realTimeDataSync } from "@/services/realTimeDataSync";

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
  const [showDetailedEntry, setShowDetailedEntry] = useState(false);
  const [editingGoal, setEditingGoal] = useState<QuickGoal | null>(null);
  const [quickGoalTeam, setQuickGoalTeam] = useState<'home' | 'away' | null>(null);

  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  // Get goals from global store for real-time updates
  const { goals: storeGoals, getUnassignedGoalsCount } = useMatchStore();

  // Enhanced goal merging with real-time priority
  const mergedGoals = React.useMemo(() => {
    console.log('🔄 ScoreTabContainer: Enhanced goal merging - Store:', storeGoals.length, 'Props:', goals.length);
    
    // Always prioritize store goals for real-time updates
    if (storeGoals.length > 0) {
      console.log('✅ ScoreTabContainer: Using store goals for real-time display');
      return storeGoals;
    }
    
    // Fall back to props goals if store is empty (initial load)
    console.log('📥 ScoreTabContainer: Using props goals as fallback');
    return goals;
  }, [storeGoals, goals]);

  // Quick goal handling
  const { isProcessingQuickGoal, handleQuickGoal } = useQuickGoalHandler({
    selectedFixtureData,
    matchTime,
    formatTime,
    forceRefresh,
    onSaveMatch
  });

  // Enhanced detailed goal handling with real-time sync
  const { handleWizardGoalAssigned } = useDetailedGoalHandler({
    onAssignGoal,
    forceRefresh: async () => {
      console.log('🔄 ScoreTabContainer: Enhanced refresh with real-time sync triggered');
      
      // First try real-time database sync
      if (selectedFixtureData?.id) {
        const syncResult = await realTimeDataSync.refreshGoalsFromDatabase(selectedFixtureData.id);
        console.log('🔄 ScoreTabContainer: Real-time sync result:', syncResult);
        
        if (syncResult.success && syncResult.localStoreUpdated) {
          console.log('✅ ScoreTabContainer: Real-time sync successful, UI should update automatically');
          return; // No need for force refresh if real-time sync worked
        }
      }
      
      // Fallback to original force refresh if real-time sync fails
      if (forceRefresh) {
        console.log('🔄 ScoreTabContainer: Falling back to force refresh');
        await forceRefresh();
      }
    }
  });

  const handleFullGoalEntry = () => {
    setQuickGoalTeam(null);
    setEditingGoal(null);
    setShowDetailedEntry(true);
  };

  // Enhanced handler with real-time goal detection
  const handleAddDetailsToGoals = () => {
    console.log('📝 ScoreTabContainer: Add details to goals requested with real-time detection');
    
    // Use real-time merged goals for detection
    const unassignedGoal = mergedGoals.find(goal => 
      goal.playerName === 'Quick Goal' || 
      goal.playerName === 'Unknown Player' ||
      (!goal.playerId && goal.type === 'goal')
    );

    if (unassignedGoal) {
      console.log('🎯 ScoreTabContainer: Found unassigned goal to edit:', unassignedGoal);
      setEditingGoal(unassignedGoal);
      setQuickGoalTeam(null);
      setShowDetailedEntry(true);
    } else {
      console.warn('⚠️ ScoreTabContainer: No unassigned goals found in real-time data');
    }
  };

  const handleWizardGoalComplete = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => {
    console.log('🎯 ScoreTabContainer: Goal wizard completed with real-time sync:', goalData);

    // Handle through enhanced detailed goal handler with real-time sync
    handleWizardGoalAssigned(goalData);

    setShowDetailedEntry(false);
    setQuickGoalTeam(null);
    setEditingGoal(null);
  };

  // Enhanced unassigned goals detection using real-time merged goals
  const unassignedGoals = React.useMemo(() => {
    const unassigned = mergedGoals.filter(goal => 
      goal.playerName === 'Quick Goal' || 
      goal.playerName === 'Unknown Player' ||
      (!goal.playerId && goal.type === 'goal')
    );
    
    console.log('📊 ScoreTabContainer: Real-time unassigned goals detected:', unassigned.length);
    return unassigned;
  }, [mergedGoals]);

  if (showDetailedEntry) {
    return (
      <div className="space-y-6">
        <GoalEntryWizard
          selectedFixtureData={selectedFixtureData}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          matchTime={matchTime}
          formatTime={formatTime}
          onGoalAssigned={handleWizardGoalComplete}
          onCancel={() => {
            setShowDetailedEntry(false);
            setQuickGoalTeam(null);
            setEditingGoal(null);
          }}
          initialTeam={quickGoalTeam || undefined}
          editingGoal={editingGoal || undefined}
        />
      </div>
    );
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
        unassignedGoalsCount={unassignedGoals.length}
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
};

export default ScoreTabContainer;
