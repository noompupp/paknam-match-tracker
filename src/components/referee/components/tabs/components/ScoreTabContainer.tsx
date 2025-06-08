
import { useState } from "react";
import GoalEntryWizard from "../../GoalEntryWizard";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import LiveScoreHeader from "./LiveScoreHeader";
import SimplifiedQuickGoalSection from "./SimplifiedQuickGoalSection";
import GoalsSummary from "./GoalsSummary";
import MatchControlsSection from "./MatchControlsSection";
import { useQuickGoalHandler } from "./QuickGoalHandler";
import { useDetailedGoalHandler } from "./DetailedGoalHandler";
import { useMatchStore } from "@/stores/useMatchStore";

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

  // Enhanced goal merging: prioritize store goals, then fall back to props
  const mergedGoals = React.useMemo(() => {
    console.log('🔄 ScoreTabContainer: Merging goals - Store:', storeGoals.length, 'Props:', goals.length);
    
    // If we have store goals, prioritize them as they're more up-to-date
    if (storeGoals.length > 0) {
      console.log('✅ ScoreTabContainer: Using store goals for real-time updates');
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

  // Detailed goal handling with enhanced refresh
  const { handleWizardGoalAssigned } = useDetailedGoalHandler({
    onAssignGoal,
    forceRefresh: async () => {
      console.log('🔄 ScoreTabContainer: Enhanced refresh triggered');
      if (forceRefresh) {
        await forceRefresh();
      }
      // Additional state refresh can be added here if needed
    }
  });

  const handleFullGoalEntry = () => {
    setQuickGoalTeam(null);
    setEditingGoal(null);
    setShowDetailedEntry(true);
  };

  // Enhanced handler for adding details to unassigned goals with real-time detection
  const handleAddDetailsToGoals = () => {
    console.log('📝 ScoreTabContainer: Add details to goals requested');
    
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
      console.warn('⚠️ ScoreTabContainer: No unassigned goals found to edit');
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
    console.log('🎯 ScoreTabContainer: Goal wizard completed:', goalData);

    // Always handle through the detailed goal handler for consistency
    handleWizardGoalAssigned(goalData);

    setShowDetailedEntry(false);
    setQuickGoalTeam(null);
    setEditingGoal(null);
  };

  // Enhanced unassigned goals detection using merged goals
  const unassignedGoals = React.useMemo(() => {
    const unassigned = mergedGoals.filter(goal => 
      goal.playerName === 'Quick Goal' || 
      goal.playerName === 'Unknown Player' ||
      (!goal.playerId && goal.type === 'goal')
    );
    
    console.log('📊 ScoreTabContainer: Unassigned goals detected:', unassigned.length);
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
        onQuickGoal={() => handleQuickGoal('home')} // Default to home team for quick goal
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
