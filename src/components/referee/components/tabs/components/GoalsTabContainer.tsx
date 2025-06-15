import { useState } from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";
import GoalsTabScoreDisplay from "./GoalsTabScoreDisplay";
import GoalsTabGoalsList from "./GoalsTabGoalsList";
import GoalsTabWizardHandler from "./GoalsTabWizardHandler";
import GoalsTabModals from "./GoalsTabModals";
import SimplifiedGoalRecording from "./SimplifiedGoalRecording";
import { useGoalsTabHandlers } from "./useGoalsTabHandlers";

interface GoalsTabContainerProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  goals: any[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onGoalTeamChange: (value: string) => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
  forceRefresh?: () => Promise<void>;
}

const GoalsTabContainer = (props: GoalsTabContainerProps) => {
  const {
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
  } = useGoalsTabHandlers({
    selectedFixtureData: props.selectedFixtureData,
    matchTime: props.matchTime,
    formatTime: props.formatTime,
    goals: props.goals,
    onAssignGoal: props.onAssignGoal,
    forceRefresh: props.forceRefresh,
  });

  // Use props for scores and calculate unassigned goals from props
  const { homeScore, awayScore } = props;
  const unassignedGoalsCount = props.goals.filter(g => g.playerName === 'Quick Goal').length;

  console.log('📊 GoalsTabContainer: Using props scores:', { homeScore, awayScore, unassignedGoalsCount });

  return (
    <div className="space-y-6">
      <GoalsTabScoreDisplay
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={props.matchTime}
        formatTime={props.formatTime}
      />

      <SimplifiedGoalRecording
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onRecordGoal={handleRecordGoal}
        isDisabled={false}
      />

      <GoalsTabModals
        showTeamSelection={showTeamSelection}
        showQuickGoalSelection={showQuickGoalSelection}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        goals={props.goals}
        formatTime={props.formatTime}
        onCloseTeamSelection={() => setShowTeamSelection(false)}
        onCloseQuickGoalSelection={() => setShowQuickGoalSelection(false)}
        onTeamSelected={handleTeamSelected}
        onQuickGoalSelected={handleQuickGoalSelected}
      />

      <GoalsTabGoalsList
        goals={props.goals}
        formatTime={props.formatTime}
      />

      <GoalsTabWizardHandler
        showWizard={showWizard}
        showQuickGoalEdit={showQuickGoalEdit}
        selectedQuickGoal={selectedQuickGoal}
        selectedFixtureData={props.selectedFixtureData}
        homeTeamPlayers={props.homeTeamPlayers}
        awayTeamPlayers={props.awayTeamPlayers}
        matchTime={props.matchTime}
        formatTime={props.formatTime}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onWizardGoalAssigned={handleWizardGoalAssigned}
        onQuickGoalUpdated={handleQuickGoalUpdated}
        onCloseWizard={() => {
          setShowWizard(false);
          setWizardInitialTeam(undefined);
        }}
        onCloseQuickGoalEdit={() => {
          setShowQuickGoalEdit(false);
          setSelectedQuickGoal(null);
        }}
        wizardInitialTeam={wizardInitialTeam}
      />
    </div>
  );
};

export default GoalsTabContainer;
