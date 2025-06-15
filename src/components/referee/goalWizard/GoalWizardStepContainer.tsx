
import React from "react";
import { WizardStep, GoalWizardData } from "./types";
import TeamSelectionStep from "./TeamSelectionStep";
import PlayerSelectionStep from "./PlayerSelectionStep";
import GoalTypeStep from "./GoalTypeStep";
import AssistSelectionStep from "./AssistSelectionStep";
import ConfirmationStep from "./ConfirmationStep";

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
