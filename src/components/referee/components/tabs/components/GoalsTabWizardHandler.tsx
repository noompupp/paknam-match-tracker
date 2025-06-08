
import { useState } from "react";
import GoalEntryWizard from "../../GoalEntryWizard";
import QuickGoalEditWizard from "../../QuickGoalEditWizard";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { useToast } from "@/hooks/use-toast";

interface GoalsTabWizardHandlerProps {
  showWizard: boolean;
  showQuickGoalEdit: boolean;
  selectedQuickGoal: any;
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  matchTime: number;
  formatTime: (seconds: number) => string;
  homeTeamName: string;
  awayTeamName: string;
  onWizardGoalAssigned: (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
  }) => void;
  onQuickGoalUpdated: (updatedGoal: any) => void;
  onCloseWizard: () => void;
  onCloseQuickGoalEdit: () => void;
  wizardInitialTeam?: 'home' | 'away';
}

const GoalsTabWizardHandler = ({
  showWizard,
  showQuickGoalEdit,
  selectedQuickGoal,
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  matchTime,
  formatTime,
  homeTeamName,
  awayTeamName,
  onWizardGoalAssigned,
  onQuickGoalUpdated,
  onCloseWizard,
  onCloseQuickGoalEdit,
  wizardInitialTeam
}: GoalsTabWizardHandlerProps) => {
  const { toast } = useToast();

  const handleQuickGoalUpdated = (updatedGoal: any) => {
    console.log('✅ GoalsTabWizardHandler: Quick goal updated:', updatedGoal);
    
    onQuickGoalUpdated(updatedGoal);
    
    toast({
      title: "Goal Updated!",
      description: `Goal assigned to ${updatedGoal.player?.name}`,
    });
  };

  if (showQuickGoalEdit && selectedQuickGoal) {
    return (
      <div className="space-y-6">
        <QuickGoalEditWizard
          quickGoal={selectedQuickGoal}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          formatTime={formatTime}
          onGoalUpdated={handleQuickGoalUpdated}
          onCancel={onCloseQuickGoalEdit}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
        />
      </div>
    );
  }

  if (showWizard) {
    return (
      <div className="space-y-6">
        <GoalEntryWizard
          selectedFixtureData={selectedFixtureData}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          matchTime={matchTime}
          formatTime={formatTime}
          onGoalAssigned={onWizardGoalAssigned}
          onCancel={onCloseWizard}
          initialTeam={wizardInitialTeam}
        />
      </div>
    );
  }

  return null;
};

export default GoalsTabWizardHandler;
