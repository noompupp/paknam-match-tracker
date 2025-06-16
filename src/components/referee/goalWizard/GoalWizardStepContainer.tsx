
import React from 'react';
import { WizardStep, GoalWizardData } from '../components/goalWizard/types';
import { ComponentPlayer } from '../hooks/useRefereeState';
import TeamSelectionStep from '../components/goalWizard/TeamSelectionStep';
import PlayerSelectionStep from '../components/goalWizard/PlayerSelectionStep';
import GoalTypeStep from '../components/goalWizard/GoalTypeStep';
import AssistSelectionStep from '../components/goalWizard/AssistSelectionStep';
import ConfirmationStep from '../components/goalWizard/ConfirmationStep';

interface GoalWizardStepContainerProps {
  currentStep: WizardStep;
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  wizardData: GoalWizardData;
  onDataChange: (data: Partial<GoalWizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  onConfirmGoal: () => void;
  matchTime: number;
}

const GoalWizardStepContainer = ({
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
}: GoalWizardStepContainerProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const commonProps = {
    selectedFixtureData,
    homeTeamPlayers,
    awayTeamPlayers,
    wizardData,
    onDataChange,
    onNext
  };

  switch (currentStep) {
    case 'team':
      return (
        <TeamSelectionStep
          selectedFixtureData={selectedFixtureData}
          onDataChange={onDataChange}
          onNext={onNext}
        />
      );
    case 'player':
      return <PlayerSelectionStep {...commonProps} />;
    case 'goal-type':
      return <GoalTypeStep {...commonProps} />;
    case 'assist':
      return <AssistSelectionStep {...commonProps} />;
    case 'confirm':
      return (
        <ConfirmationStep
          selectedFixtureData={selectedFixtureData}
          wizardData={wizardData}
          matchTime={matchTime}
          formatTime={formatTime}
          onConfirm={onConfirmGoal}
          onBack={onBack}
        />
      );
    default:
      return null;
  }
};

export default GoalWizardStepContainer;
