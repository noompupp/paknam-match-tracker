
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
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";

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
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>('team');
  const [wizardData, setWizardData] = useState<GoalWizardData>({
    selectedTeam: null,
    selectedPlayer: null,
    isOwnGoal: false,
    needsAssist: false,
    assistPlayer: null
  });

  const { addGoal, addAssist, goals } = useMatchStore();
  const { toast } = useToast();

  // FIX: Add isSaving at top-level state
  const [isSaving, setIsSaving] = useState(false);

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

  const handleConfirm = async () => {
    if (!wizardData.selectedPlayer || !wizardData.selectedTeam) {
      console.error('❌ GoalWizard: Missing required data for goal assignment');
      toast({
        title: "Missing Data",
        description: "Please select both a player and team before confirming the goal.",
        variant: "destructive"
      });
      return;
    }

    const homeTeamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id;
    const awayTeamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id;
    const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
    const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

    const beneficiaryTeamId = wizardData.selectedTeam === 'home' ? homeTeamId : awayTeamId;
    const beneficiaryTeamName = wizardData.selectedTeam === 'home' ? homeTeamName : awayTeamName;

    setIsSaving(true); // Move isSaving here

    try {
      // Duplicate check BEFORE addGoal
      const duplicate = goals.find(g =>
        g.playerId === wizardData.selectedPlayer.id &&
        g.time === matchTime &&
        g.teamId === (wizardData.selectedPlayer.team === homeTeamName ? homeTeamId : awayTeamId) &&
        g.type === 'goal' &&
        Boolean(g.isOwnGoal) === Boolean(wizardData.isOwnGoal)
      );
      if (duplicate) {
        setIsSaving(false);
        toast({
          title: "Duplicate Goal",
          description: "A goal for this player, time, and team already exists. No duplicate created.",
          variant: "destructive"
        });
        return;
      }

      // Add the goal via deduped store. If it returns null, it's a duplicate.
      const goalData = addGoal({
        playerId: wizardData.selectedPlayer.id,
        playerName: wizardData.selectedPlayer.name,
        teamId: wizardData.selectedPlayer.team === homeTeamName ? homeTeamId : awayTeamId,
        teamName: wizardData.selectedPlayer.team,
        type: 'goal' as const,
        time: matchTime,
        isOwnGoal: wizardData.isOwnGoal
      });

      if (!goalData) {
        setIsSaving(false);
        toast({
          title: "Duplicate Goal",
          description: "A goal for this player, time, and team already exists.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Goal Added",
        description: `${wizardData.selectedPlayer.name} (${goalData.teamName}) at ${matchTime}s${wizardData.isOwnGoal ? ' (Own Goal)' : ''}. Scoreboard updated. Remember to Save!`,
        variant: "default"
      });

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

        toast({
          title: "Assist Added",
          description: `${wizardData.assistPlayer.name} (${assistData.teamName}) at ${matchTime}s. Remember to Save!`,
          variant: "default"
        });
      }

      // Success, auto clear state, close dialog, auto-refresh data in parent after
      setIsSaving(false);
      resetWizard();
      onClose();

    } catch (error) {
      setIsSaving(false);
      console.error('❌ GoalWizard: Error during goal assignment:', error);
      toast({
        title: "Error Adding Goal",
        description: "There was a problem adding the goal. Please try again.",
        variant: "destructive"
      });
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
      case 'team': return t('wizard.selectScoringTeam');
      case 'player': return t('wizard.selectGoalScorer');
      case 'goal-type': return t('wizard.goalType');
      case 'assist': return t('wizard.addAssist');
      case 'confirm': return t('wizard.confirmGoal');
      default: return t('referee.recordGoalTitle');
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
        {/* Confirmation Step: Save Button */}
        {currentStep === 'confirm' && (
          <button
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded disabled:opacity-60 flex items-center justify-center gap-2"
            onClick={handleConfirm}
            disabled={isSaving}
            type="button"
          >
            {isSaving ? (
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <span className="font-semibold">Save Goal</span>
            )}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoalWizard;

