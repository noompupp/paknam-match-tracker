
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft } from "lucide-react";
import { ComponentPlayer } from "../hooks/useRefereeState";
import { WizardStep, GoalWizardData } from "./goalWizard/types";
import StepIndicator from "./goalWizard/StepIndicator";
import TeamSelectionStep from "./goalWizard/TeamSelectionStep";
import PlayerSelectionStep from "./goalWizard/PlayerSelectionStep";
import GoalTypeStep from "./goalWizard/GoalTypeStep";
import AssistStep from "./goalWizard/AssistStep";
import ConfirmationStep from "./goalWizard/ConfirmationStep";

interface GoalEntryWizardProps {
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  matchTime: number;
  formatTime: (seconds: number) => string;
  onGoalAssigned: (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
  }) => void;
  onCancel: () => void;
}

const GoalEntryWizard = ({
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  matchTime,
  formatTime,
  onGoalAssigned,
  onCancel
}: GoalEntryWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('team');
  const [wizardData, setWizardData] = useState<GoalWizardData>({
    selectedTeam: null,
    selectedPlayer: null,
    isOwnGoal: false,
    needsAssist: false,
    assistPlayer: null,
  });

  const handleDataChange = (data: Partial<GoalWizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'team':
        setCurrentStep('player');
        break;
      case 'player':
        setCurrentStep('goal-type');
        break;
      case 'goal-type':
        if (wizardData.isOwnGoal) {
          setCurrentStep('confirm');
        } else {
          setCurrentStep('assist');
        }
        break;
      case 'assist':
        setCurrentStep('confirm');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'player':
        setCurrentStep('team');
        break;
      case 'goal-type':
        setCurrentStep('player');
        break;
      case 'assist':
        setCurrentStep('goal-type');
        break;
      case 'confirm':
        if (wizardData.isOwnGoal || !wizardData.needsAssist) {
          setCurrentStep('goal-type');
        } else {
          setCurrentStep('assist');
        }
        break;
    }
  };

  const handleConfirm = () => {
    if (!wizardData.selectedPlayer || !wizardData.selectedTeam) return;

    // First assign the goal
    onGoalAssigned({
      player: wizardData.selectedPlayer,
      goalType: 'goal',
      team: wizardData.selectedTeam,
      isOwnGoal: wizardData.isOwnGoal
    });

    // Then assign the assist if applicable
    if (wizardData.assistPlayer && !wizardData.isOwnGoal && wizardData.selectedTeam) {
      setTimeout(() => {
        onGoalAssigned({
          player: wizardData.assistPlayer!,
          goalType: 'assist',
          team: wizardData.selectedTeam!
        });
      }, 100);
    }
  };

  const canGoBack = currentStep !== 'team';

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'team':
        return (
          <TeamSelectionStep
            selectedFixtureData={selectedFixtureData}
            onDataChange={handleDataChange}
            onNext={handleNext}
          />
        );
      case 'player':
        return (
          <PlayerSelectionStep
            selectedFixtureData={selectedFixtureData}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
            wizardData={wizardData}
            onDataChange={handleDataChange}
            onNext={handleNext}
          />
        );
      case 'goal-type':
        return (
          <GoalTypeStep
            selectedFixtureData={selectedFixtureData}
            wizardData={wizardData}
            onNext={handleNext}
          />
        );
      case 'assist':
        return (
          <AssistStep
            selectedFixtureData={selectedFixtureData}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
            wizardData={wizardData}
            onDataChange={handleDataChange}
            onNext={handleNext}
          />
        );
      case 'confirm':
        return (
          <ConfirmationStep
            selectedFixtureData={selectedFixtureData}
            wizardData={wizardData}
            matchTime={matchTime}
            formatTime={formatTime}
            onConfirm={handleConfirm}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Entry - {formatTime(matchTime)}
        </CardTitle>
        <StepIndicator currentStep={currentStep} isOwnGoal={wizardData.isOwnGoal} />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderCurrentStep()}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
          {canGoBack && (
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalEntryWizard;
