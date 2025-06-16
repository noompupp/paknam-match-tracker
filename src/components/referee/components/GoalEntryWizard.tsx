
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft, Edit } from "lucide-react";
import { ComponentPlayer } from "../hooks/useRefereeState";
import { WizardStep, GoalWizardData, GoalAssignmentData } from "./goalWizard/types";
import StepIndicator from "./goalWizard/StepIndicator";
import TeamSelectionStep from "./goalWizard/TeamSelectionStep";
import PlayerSelectionStep from "./goalWizard/PlayerSelectionStep";
import GoalTypeStep from "./goalWizard/GoalTypeStep";
import AssistStep from "./goalWizard/AssistStep";
import ConfirmationStep from "./goalWizard/ConfirmationStep";
import { useTranslation } from "@/hooks/useTranslation";

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

interface GoalEntryWizardProps {
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  matchTime: number;
  formatTime: (seconds: number) => string;
  onGoalAssigned: (goalData: GoalAssignmentData) => void;
  onCancel: () => void;
  initialTeam?: 'home' | 'away';
  editingGoal?: QuickGoal;
}

const GoalEntryWizard = ({
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  matchTime,
  formatTime,
  onGoalAssigned,
  onCancel,
  initialTeam,
  editingGoal
}: GoalEntryWizardProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialTeam ? 'player' : 'team');
  const [wizardData, setWizardData] = useState<GoalWizardData>({
    selectedTeam: initialTeam || null,
    selectedPlayer: null,
    isOwnGoal: false,
    needsAssist: false,
    assistPlayer: null,
  });

  const isEditMode = !!editingGoal;
  const homeTeamName = selectedFixtureData?.home_team?.name || t('referee.homeTeam', 'Home Team');
  const awayTeamName = selectedFixtureData?.away_team?.name || t('referee.awayTeam', 'Away Team');

  // Initialize wizard data when editing a goal
  useEffect(() => {
    if (editingGoal) {
      // Determine team from the goal data
      let goalTeam: 'home' | 'away' = 'home';
      
      if (editingGoal.team === 'home' || editingGoal.team === 'away') {
        goalTeam = editingGoal.team;
      } else if (editingGoal.teamName) {
        goalTeam = editingGoal.teamName === homeTeamName ? 'home' : 'away';
      } else if (editingGoal.team_id) {
        goalTeam = editingGoal.team_id.includes('home') || editingGoal.team_id === homeTeamName ? 'home' : 'away';
      }

      setWizardData(prev => ({
        ...prev,
        selectedTeam: goalTeam,
      }));

      setCurrentStep('player');
    }
  }, [editingGoal, homeTeamName, awayTeamName]);

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
        if (initialTeam || isEditMode) {
          onCancel();
        } else {
          setCurrentStep('team');
        }
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
    if (!wizardData.selectedPlayer || !wizardData.selectedTeam) {
      return;
    }

    const goalData: GoalAssignmentData = {
      player: wizardData.selectedPlayer,
      goalType: 'goal',
      team: wizardData.selectedTeam,
      isOwnGoal: wizardData.isOwnGoal,
      assistPlayer: wizardData.assistPlayer || undefined,
      isEdit: isEditMode,
      originalGoalId: editingGoal?.id
    };

    onGoalAssigned(goalData);
  };

  const canGoBack = currentStep !== 'team' && !initialTeam && !isEditMode;
  const displayTime = editingGoal ? formatTime(editingGoal.event_time || editingGoal.time || 0) : formatTime(matchTime);

  const renderCurrentStep = () => {
    const commonProps = {
      selectedFixtureData,
      homeTeamPlayers,
      awayTeamPlayers,
      wizardData,
      onDataChange: handleDataChange,
      onNext: handleNext
    };

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
        return <PlayerSelectionStep {...commonProps} />;
      case 'goal-type':
        return <GoalTypeStep {...commonProps} />;
      case 'assist':
        return <AssistStep {...commonProps} />;
      case 'confirm':
        return (
          <ConfirmationStep
            selectedFixtureData={selectedFixtureData}
            wizardData={wizardData}
            matchTime={editingGoal ? (editingGoal.event_time || editingGoal.time || 0) : matchTime}
            formatTime={formatTime}
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          {isEditMode ? (
            <>
              <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              <span className="truncate">
                {t('wizard.editGoal', 'Edit Goal Details - {time}', { time: displayTime })}
              </span>
            </>
          ) : (
            <>
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">
                {t('wizard.goalEntryTime', 'Goal Entry - {time}', { time: displayTime })}
              </span>
            </>
          )}
        </CardTitle>
        
        {/* Mobile-optimized step indicator */}
        <div className="mt-2">
          <StepIndicator currentStep={currentStep} isOwnGoal={wizardData.isOwnGoal} />
        </div>
        
        {isEditMode && editingGoal && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
            <div className="text-sm font-medium text-orange-800">
              {t('wizard.editing', 'Editing quick goal entry')} - {displayTime}
            </div>
            <div className="text-xs text-orange-700 mt-1">
              {t('wizard.goalBenefits', 'Goal benefits')}: {wizardData.selectedTeam === 'home' ? homeTeamName : awayTeamName}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {renderCurrentStep()}

        {/* Mobile-optimized navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
          <Button 
            onClick={onCancel} 
            variant="ghost" 
            className="order-2 sm:order-1 w-full sm:w-auto"
          >
            {t('wizard.cancel', 'Cancel')}
          </Button>
          {canGoBack && (
            <Button 
              onClick={handleBack} 
              variant="outline"
              className="order-1 sm:order-2 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('wizard.back', 'Back')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalEntryWizard;
