
import React from "react";
import { WizardStep, GoalWizardData } from "../components/goalWizard/types";
import TeamSelectionStep from "../components/goalWizard/TeamSelectionStep";
import PlayerSelectionStep from "../components/goalWizard/PlayerSelectionStep";
import GoalTypeStep from "../components/goalWizard/GoalTypeStep";
import AssistSelectionStep from "../components/goalWizard/AssistSelectionStep";
import ConfirmationStep from "../components/goalWizard/ConfirmationStep";

interface StepContainerProps {
  currentStep: WizardStep;
  selectedFixtureData: any;
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
  wizardData: GoalWizardData;
  onDataChange: (p: Partial<GoalWizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  onConfirmGoal: () => void;
  matchTime?: number;
}

const GoalWizardStepContainer: React.FC<StepContainerProps> = ({
  currentStep,
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  wizardData,
  onDataChange,
  onNext,
  onBack,
  onConfirmGoal,
  matchTime
}) => {
  const commonProps = { selectedFixtureData, homeTeamPlayers, awayTeamPlayers, wizardData, onDataChange, onNext };

  switch (currentStep) {
    case "team":
      return <TeamSelectionStep {...commonProps} />;
    case "player":
      return <PlayerSelectionStep {...commonProps} />;
    case "goal-type":
      return <GoalTypeStep {...commonProps} />;
    case "assist":
      return <AssistSelectionStep {...commonProps} />;
    case "confirm":
      return (
        <ConfirmationStep
          selectedFixtureData={selectedFixtureData}
          wizardData={wizardData}
          onConfirm={onConfirmGoal}
          onBack={onBack}
        />
      );
    default:
      return null;
  }
};

export default GoalWizardStepContainer;
