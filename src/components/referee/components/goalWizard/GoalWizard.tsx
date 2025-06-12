
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMatchStore } from "@/stores/useMatchStore";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { WizardStep, GoalWizardData } from "./types";
import TeamSelectionStep from "./TeamSelectionStep";
import PlayerSelectionStep from "./PlayerSelectionStep";
import GoalTypeStep from "./GoalTypeStep";
import AssistSelectionStep from "./AssistSelectionStep";
import ConfirmationStep from "./ConfirmationStep";

interface GoalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  matchTime: number;
}

const GoalWizard = ({
  isOpen,
  onClose,
  selectedFixtureData,
  homeTeamPlayers = [],
  awayTeamPlayers = [],
  matchTime
}: GoalWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('team');
  const [wizardData, setWizardData] = useState<GoalWizardData>({
    selectedTeam: null,
    selectedPlayer: null,
    isOwnGoal: false,
    needsAssist: false,
    assistPlayer: null
  });

  const { addGoal, addAssist } = useMatchStore();

  const resetWizard = () => {
    setCurrentStep('team');
    setWizardData({
      selectedTeam: null,
      selectedPlayer: null,
      isOwnGoal: false,
      needsAssist: false,
      assistPlayer: null
    });
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleDataChange = (data: Partial<GoalWizardData>) => {
    console.log('🎯 GoalWizard: Data change with own goal support:', data);
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
          // Skip assist selection for own goals
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
        if (wizardData.isOwnGoal) {
          setCurrentStep('goal-type');
        } else {
          setCurrentStep('assist');
        }
        break;
    }
  };

  const handleConfirm = () => {
    if (!wizardData.selectedPlayer || !wizardData.selectedTeam) {
      console.error('❌ GoalWizard: Missing required data for goal assignment');
      return;
    }

    const homeTeamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id;
    const awayTeamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id;
    const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
    const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

    // Determine the correct team IDs based on which team benefits from the goal
    const beneficiaryTeamId = wizardData.selectedTeam === 'home' ? homeTeamId : awayTeamId;
    const beneficiaryTeamName = wizardData.selectedTeam === 'home' ? homeTeamName : awayTeamName;

    console.log('🎯 GoalWizard: Confirming goal with comprehensive own goal support:', {
      selectedPlayer: wizardData.selectedPlayer.name,
      selectedPlayerTeam: wizardData.selectedPlayer.team,
      selectedTeam: wizardData.selectedTeam,
      beneficiaryTeam: beneficiaryTeamName,
      isOwnGoal: wizardData.isOwnGoal,
      matchTime,
      assistPlayer: wizardData.assistPlayer?.name
    });

    try {
      // Add the goal with proper own goal flag
      const goalData = addGoal({
        playerId: wizardData.selectedPlayer.id,
        playerName: wizardData.selectedPlayer.name,
        teamId: wizardData.selectedPlayer.team === homeTeamName ? homeTeamId : awayTeamId, // Player's actual team
        teamName: wizardData.selectedPlayer.team, // Player's actual team name
        type: 'goal' as const,
        time: matchTime,
        isOwnGoal: wizardData.isOwnGoal // CRITICAL: Pass the own goal flag
      });

      console.log('✅ GoalWizard: Goal added with own goal support:', goalData);

      // Add assist if applicable (not for own goals)
      if (!wizardData.isOwnGoal && wizardData.needsAssist && wizardData.assistPlayer) {
        const assistData = addAssist({
          playerId: wizardData.assistPlayer.id,
          playerName: wizardData.assistPlayer.name,
          teamId: wizardData.assistPlayer.team === homeTeamName ? homeTeamId : awayTeamId,
          teamName: wizardData.assistPlayer.team,
          type: 'assist' as const,
          time: matchTime,
          isOwnGoal: false // Assists cannot be own goals
        });

        console.log('✅ GoalWizard: Assist added:', assistData);
      }

      handleClose();
    } catch (error) {
      console.error('❌ GoalWizard: Error during goal assignment:', error);
    }
  };

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
        return <TeamSelectionStep {...commonProps} />;
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
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'team': return 'Select Scoring Team';
      case 'player': return 'Select Goal Scorer';
      case 'goal-type': return 'Confirm Goal Type';
      case 'assist': return 'Add Assist (Optional)';
      case 'confirm': return 'Confirm Goal';
      default: return 'Record Goal';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalWizard;
