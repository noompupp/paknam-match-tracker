
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { quickGoalService } from "@/services/quickGoalService";
import { ComponentPlayer } from "../../../hooks/useRefereeState";

interface UseGoalsTabHandlersParams {
  selectedFixtureData: any;
  matchTime: number;
  formatTime: (seconds: number) => string;
  goals: any[];
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
}

export function useGoalsTabHandlers({
  selectedFixtureData,
  matchTime,
  formatTime,
  goals,
  onAssignGoal,
  forceRefresh,
}: UseGoalsTabHandlersParams) {
  const [showWizard, setShowWizard] = useState(false);
  const [showQuickGoalSelection, setShowQuickGoalSelection] = useState(false);
  const [showQuickGoalEdit, setShowQuickGoalEdit] = useState(false);
  const [selectedQuickGoal, setSelectedQuickGoal] = useState<any>(null);
  const [wizardInitialTeam, setWizardInitialTeam] = useState<'home' | 'away' | undefined>();
  const [wizardMode, setWizardMode] = useState<'quick' | 'detailed' | 'assign'>('quick');
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [teamSelectionMode, setTeamSelectionMode] = useState<'quick' | 'detailed'>('quick');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  // Enhanced quick goal handler
  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!selectedFixtureData || isProcessingQuickGoal) return;

    setIsProcessingQuickGoal(true);

    try {
      console.log('⚡ GoalsTabContainer: Adding quick goal for team:', team);

      const homeTeamId = selectedFixtureData.home_team?.__id__ || selectedFixtureData.home_team_id;
      const awayTeamId = selectedFixtureData.away_team?.__id__ || selectedFixtureData.away_team_id;

      const result = await quickGoalService.addQuickGoal({
        fixtureId: selectedFixtureData.id,
        team,
        matchTime,
        homeTeam: {
          id: homeTeamId,
          name: selectedFixtureData.home_team?.name,
          __id__: homeTeamId,
        },
        awayTeam: {
          id: awayTeamId,
          name: selectedFixtureData.away_team?.name,
          __id__: awayTeamId,
        }
      });

      if (result.success) {
        toast({
          title: "⚡ Quick Goal Added!",
          description: `Goal recorded for ${team === 'home' ? homeTeamName : awayTeamName} at ${formatTime(matchTime)}. Score updated automatically.`,
        });

        setRefreshTrigger(prev => prev + 1);

        if (forceRefresh) {
          setTimeout(() => {
            forceRefresh();
          }, 300);
        }
      } else {
        toast({
          title: "Quick Goal Failed",
          description: result.error || 'Failed to add quick goal',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ GoalsTabContainer: Error adding quick goal:', error);
      toast({
        title: "Quick Goal Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessingQuickGoal(false);
    }
  };

  // Handle goal recording - simplified to only show wizard
  const handleRecordGoal = () => {
    setShowWizard(true);
  };

  // Handle team selection from modal
  const handleTeamSelected = (team: 'home' | 'away') => {
    if (teamSelectionMode === 'quick') {
      handleQuickGoal(team);
    } else {
      setWizardInitialTeam(team);
      setShowWizard(true);
    }
  };

  // Handle quick goal selection from modal
  const handleQuickGoalSelected = (goal: any) => {
    console.log('🎯 GoalsTabContainer: Quick goal selected for editing:', goal);
    setSelectedQuickGoal(goal);
    setShowQuickGoalSelection(false);
    setShowQuickGoalEdit(true);
  };

  // Handle quick goal update completion
  const handleQuickGoalUpdated = (updatedGoal: any) => {
    console.log('✅ GoalsTabContainer: Quick goal updated:', updatedGoal);

    setRefreshTrigger(prev => prev + 1);

    if (forceRefresh) {
      setTimeout(() => {
        forceRefresh();
      }, 300);
    }

    setShowQuickGoalEdit(false);
    setSelectedQuickGoal(null);
  };

  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
  }) => {
    console.log('🎯 GoalsTabContainer: Goal assigned via wizard:', goalData);
    onAssignGoal(goalData.player);

    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      setTimeout(() => {
        onAssignGoal(goalData.assistPlayer!);
      }, 100);
    }

    setRefreshTrigger(prev => prev + 1);

    if (forceRefresh) {
      setTimeout(() => {
        forceRefresh();
      }, 300);
    }

    setShowWizard(false);
    setWizardInitialTeam(undefined);
  };

  return {
    handlers: {
      showWizard,
      setShowWizard,
      showQuickGoalSelection,
      setShowQuickGoalSelection,
      showQuickGoalEdit,
      setShowQuickGoalEdit,
      selectedQuickGoal,
      setSelectedQuickGoal,
      wizardInitialTeam,
      setWizardInitialTeam,
      wizardMode,
      setWizardMode,
      isProcessingQuickGoal,
      showTeamSelection,
      setShowTeamSelection,
      teamSelectionMode,
      setTeamSelectionMode,
      refreshTrigger,
      handleQuickGoal,
      handleRecordGoal,
      handleTeamSelected,
      handleQuickGoalSelected,
      handleQuickGoalUpdated,
      handleWizardGoalAssigned,
      homeTeamName,
      awayTeamName,
    }
  }
}
