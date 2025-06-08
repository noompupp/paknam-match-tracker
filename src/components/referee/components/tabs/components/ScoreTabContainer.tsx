
import React, { useState, useEffect } from "react";
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

  // Enhanced real-time store integration
  const { goals: storeGoals, getUnassignedGoalsCount, lastUpdated, triggerUIUpdate } = useMatchStore();

  // Enhanced goal merging with real-time priority and auto-refresh
  const mergedGoals = React.useMemo(() => {
    console.log('🔄 ScoreTabContainer: Enhanced goal merging with auto-refresh:', {
      storeGoals: storeGoals.length,
      propsGoals: goals.length,
      lastUpdated
    });
    
    // Always prioritize store goals for real-time updates
    if (storeGoals.length > 0) {
      console.log('✅ ScoreTabContainer: Using store goals for enhanced real-time display');
      return storeGoals;
    }
    
    // Fall back to props goals if store is empty (initial load)
    console.log('📥 ScoreTabContainer: Using props goals as fallback');
    return goals;
  }, [storeGoals, goals, lastUpdated]);

  // Enhanced unassigned goals detection with real-time updates
  const unassignedGoals = React.useMemo(() => {
    const unassigned = mergedGoals.filter(goal => 
      goal.playerName === 'Quick Goal' || 
      goal.playerName === 'Unknown Player' ||
      (!goal.playerId && goal.type === 'goal')
    );
    
    console.log('📊 ScoreTabContainer: Enhanced real-time unassigned goals:', {
      count: unassigned.length,
      goals: unassigned.map(g => ({ id: g.id, playerName: g.playerName })),
      lastUpdated
    });
    
    return unassigned;
  }, [mergedGoals, lastUpdated]);

  // Auto-refresh effect when lastUpdated changes
  useEffect(() => {
    console.log('🔄 ScoreTabContainer: Auto-refresh triggered by lastUpdated:', lastUpdated);
  }, [lastUpdated]);

  // Quick goal handling
  const { isProcessingQuickGoal, handleQuickGoal } = useQuickGoalHandler({
    selectedFixtureData,
    matchTime,
    formatTime,
    forceRefresh: async () => {
      console.log('🔄 ScoreTabContainer: Enhanced force refresh with comprehensive sync');
      
      // Enhanced refresh with real-time sync
      if (selectedFixtureData?.id) {
        await realTimeDataSync.forceGoalResync(selectedFixtureData.id);
      }
      
      // Trigger original force refresh
      if (forceRefresh) {
        await forceRefresh();
      }
      
      // Additional UI update trigger
      triggerUIUpdate();
    },
    onSaveMatch
  });

  // Enhanced detailed goal handling with comprehensive real-time sync
  const { handleWizardGoalAssigned } = useDetailedGoalHandler({
    onAssignGoal,
    forceRefresh: async () => {
      console.log('🔄 ScoreTabContainer: Enhanced detailed goal refresh with comprehensive sync');
      
      // Multi-layer refresh approach
      if (selectedFixtureData?.id) {
        // Force comprehensive goal resync
        const syncResult = await realTimeDataSync.forceGoalResync(selectedFixtureData.id);
        console.log('🔄 ScoreTabContainer: Comprehensive sync result:', syncResult);
      }
      
      // Original force refresh
      if (forceRefresh) {
        await forceRefresh();
      }
      
      // Additional UI refresh
      setTimeout(() => {
        triggerUIUpdate();
        console.log('🔄 ScoreTabContainer: Additional UI refresh after detailed goal processing');
      }, 100);
    }
  });

  const handleFullGoalEntry = () => {
    setQuickGoalTeam(null);
    setEditingGoal(null);
    setShowDetailedEntry(true);
  };

  // Enhanced handler with improved goal detection
  const handleAddDetailsToGoals = () => {
    console.log('📝 ScoreTabContainer: Enhanced add details with improved detection');
    
    // Use enhanced real-time unassigned goals detection
    const targetGoal = unassignedGoals.length > 0 ? unassignedGoals[0] : null;

    if (targetGoal) {
      console.log('🎯 ScoreTabContainer: Found target goal for editing:', {
        id: targetGoal.id,
        playerName: targetGoal.playerName,
        team: targetGoal.team
      });
      
      setEditingGoal(targetGoal);
      setQuickGoalTeam(null);
      setShowDetailedEntry(true);
    } else {
      console.warn('⚠️ ScoreTabContainer: No unassigned goals found in enhanced detection');
      
      // Force a refresh and try again
      if (forceRefresh) {
        forceRefresh().then(() => {
          console.log('🔄 ScoreTabContainer: Refresh completed, checking again for unassigned goals');
        });
      }
    }
  };

  const handleWizardGoalComplete = async (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => {
    console.log('🎯 ScoreTabContainer: Enhanced goal wizard completion:', goalData);

    // Enhanced goal assignment with improved tracking
    if (goalData.isEdit && editingGoal) {
      console.log('✏️ ScoreTabContainer: Processing edit mode with enhanced tracking:', {
        originalGoal: editingGoal,
        newPlayer: goalData.player.name
      });
      
      // Pass the editing goal ID for better matching
      await handleWizardGoalAssigned({
        ...goalData,
        originalGoalId: editingGoal.id
      });
    } else {
      console.log('🆕 ScoreTabContainer: Processing new goal creation');
      await handleWizardGoalAssigned(goalData);
    }

    // Enhanced cleanup with UI refresh
    setShowDetailedEntry(false);
    setQuickGoalTeam(null);
    setEditingGoal(null);
    
    // Additional UI refresh after wizard completion
    setTimeout(() => {
      triggerUIUpdate();
      console.log('🔄 ScoreTabContainer: Post-wizard UI refresh triggered');
    }, 150);
  };

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
