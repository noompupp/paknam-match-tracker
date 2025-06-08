
import React, { useState } from "react";
import GoalEntryWizard from "../../GoalEntryWizard";
import { ComponentPlayer } from "../../../hooks/useRefereeState";

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

interface GoalWizardManagerProps {
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  matchTime: number;
  formatTime: (seconds: number) => string;
  unassignedGoals: any[];
  forceRefresh?: () => Promise<void>;
  onWizardGoalComplete: (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => Promise<void>;
  children: (actions: {
    showDetailedEntry: boolean;
    editingGoal: QuickGoal | null;
    quickGoalTeam: 'home' | 'away' | null;
    handleFullGoalEntry: () => void;
    handleAddDetailsToGoals: () => void;
    setShowDetailedEntry: (show: boolean) => void;
    setEditingGoal: (goal: QuickGoal | null) => void;
    setQuickGoalTeam: (team: 'home' | 'away' | null) => void;
  }) => React.ReactNode;
}

const GoalWizardManager = ({
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  matchTime,
  formatTime,
  unassignedGoals,
  forceRefresh,
  onWizardGoalComplete,
  children
}: GoalWizardManagerProps) => {
  const [showDetailedEntry, setShowDetailedEntry] = useState(false);
  const [editingGoal, setEditingGoal] = useState<QuickGoal | null>(null);
  const [quickGoalTeam, setQuickGoalTeam] = useState<'home' | 'away' | null>(null);

  const handleFullGoalEntry = () => {
    setQuickGoalTeam(null);
    setEditingGoal(null);
    setShowDetailedEntry(true);
  };

  // Enhanced handler with improved goal detection
  const handleAddDetailsToGoals = () => {
    console.log('📝 GoalWizardManager: Enhanced add details with improved detection');
    
    // Use enhanced real-time unassigned goals detection
    const targetGoal = unassignedGoals.length > 0 ? unassignedGoals[0] : null;

    if (targetGoal) {
      console.log('🎯 GoalWizardManager: Found target goal for editing:', {
        id: targetGoal.id,
        playerName: targetGoal.playerName,
        team: targetGoal.team
      });
      
      setEditingGoal(targetGoal);
      setQuickGoalTeam(null);
      setShowDetailedEntry(true);
    } else {
      console.warn('⚠️ GoalWizardManager: No unassigned goals found in enhanced detection');
      
      // Force a refresh and try again
      if (forceRefresh) {
        forceRefresh().then(() => {
          console.log('🔄 GoalWizardManager: Refresh completed, checking again for unassigned goals');
        });
      }
    }
  };

  const handleWizardGoalAssigned = async (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => {
    console.log('🎯 GoalWizardManager: Enhanced goal wizard completion:', goalData);

    // Enhanced goal assignment with improved tracking
    if (goalData.isEdit && editingGoal) {
      console.log('✏️ GoalWizardManager: Processing edit mode with enhanced tracking:', {
        originalGoal: editingGoal,
        newPlayer: goalData.player.name
      });
      
      // Pass the editing goal ID for better matching
      await onWizardGoalComplete({
        ...goalData,
        originalGoalId: editingGoal.id
      });
    } else {
      console.log('🆕 GoalWizardManager: Processing new goal creation');
      await onWizardGoalComplete(goalData);
    }

    // Enhanced cleanup with UI refresh
    setShowDetailedEntry(false);
    setQuickGoalTeam(null);
    setEditingGoal(null);
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
          onGoalAssigned={handleWizardGoalAssigned}
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
    <>
      {children({
        showDetailedEntry,
        editingGoal,
        quickGoalTeam,
        handleFullGoalEntry,
        handleAddDetailsToGoals,
        setShowDetailedEntry,
        setEditingGoal,
        setQuickGoalTeam
      })}
    </>
  );
};

export default GoalWizardManager;
