
import React from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { useMatchStore } from "@/stores/useMatchStore";
import { useToast } from "@/hooks/use-toast";

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

interface ScoreTabEventHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  unassignedGoalsCount: number;
  isProcessingQuickGoal: boolean;
  setIsProcessingQuickGoal: (processing: boolean) => void;
  setShowTeamSelection: (show: boolean) => void;
  setShowQuickGoalSelection: (show: boolean) => void;
  setEditingGoal: (goal: QuickGoal | null) => void;
  setShowWizard: (show: boolean) => void;
  children: (handlers: {
    handleQuickGoal: (team: 'home' | 'away') => Promise<void>;
    handleQuickGoalClick: () => void;
    handleFullGoalEntryClick: () => void;
    handleAddDetailsToGoalsClick: () => void;
    handleTeamSelected: (team: 'home' | 'away') => void;
    handleQuickGoalSelected: (goal: any) => void;
  }) => React.ReactNode;
}

const ScoreTabEventHandlers = ({
  selectedFixtureData,
  matchTime,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  unassignedGoalsCount,
  isProcessingQuickGoal,
  setIsProcessingQuickGoal,
  setShowTeamSelection,
  setShowQuickGoalSelection,
  setEditingGoal,
  setShowWizard,
  children
}: ScoreTabEventHandlersProps) => {
  const { addGoal, addEvent } = useMatchStore();
  const { toast } = useToast();

  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!selectedFixtureData || isProcessingQuickGoal) return;

    setIsProcessingQuickGoal(true);

    try {
      console.log('⚡ ScoreTab: Adding quick goal locally for team:', team);
      
      const teamId = team === 'home' ? homeTeamId : awayTeamId;
      const teamName = team === 'home' ? homeTeamName : awayTeamName;

      const localGoal = addGoal({
        playerName: 'Quick Goal',
        team,
        teamId,
        teamName,
        type: 'goal',
        time: matchTime
      });

      addEvent('Quick Goal', `Quick goal added for ${teamName}`, matchTime);

      toast({
        title: "⚡ Quick Goal Added!",
        description: `Goal added locally for ${teamName}. Auto-save will sync shortly!`,
      });

      console.log('✅ ScoreTab: Quick goal added to global store:', localGoal);
      
    } catch (error) {
      console.error('❌ ScoreTab: Error adding quick goal:', error);
      toast({
        title: "Quick Goal Failed",
        description: "Failed to add quick goal locally",
        variant: "destructive"
      });
    } finally {
      setIsProcessingQuickGoal(false);
    }
  };

  const handleQuickGoalClick = () => {
    setShowTeamSelection(true);
  };

  const handleFullGoalEntryClick = () => {
    setEditingGoal(null);
    setShowWizard(true);
  };

  const handleAddDetailsToGoalsClick = () => {
    console.log('📝 ScoreTab: Add details to goals clicked');
    if (unassignedGoalsCount > 0) {
      setShowQuickGoalSelection(true);
    } else {
      toast({
        title: "No Quick Goals Found",
        description: "There are no quick goals that need player details.",
        variant: "default"
      });
    }
  };

  const handleTeamSelected = (team: 'home' | 'away') => {
    handleQuickGoal(team);
  };

  const handleQuickGoalSelected = (goal: any) => {
    console.log('🎯 ScoreTab: Quick goal selected for editing:', goal);
    setEditingGoal(goal);
    setShowQuickGoalSelection(false);
    setShowWizard(true);
  };

  return (
    <>
      {children({
        handleQuickGoal,
        handleQuickGoalClick,
        handleFullGoalEntryClick,
        handleAddDetailsToGoalsClick,
        handleTeamSelected,
        handleQuickGoalSelected
      })}
    </>
  );
};

export default ScoreTabEventHandlers;
