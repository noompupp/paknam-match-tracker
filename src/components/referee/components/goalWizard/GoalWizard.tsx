
import React, { useState } from 'react';
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { WizardStep, GoalWizardData } from "./types";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { AlertTriangle } from "lucide-react";
import PulseDotBadge from "@/components/ui/PulseDotBadge";
import { 
  GoalWizardDialog, 
  GoalWizardDialogContent, 
  GoalWizardDialogHeader, 
  GoalWizardDialogTitle 
} from "./GoalWizardDialog";
import GoalWizardSyncStatus from "./GoalWizardSyncStatus";
import GoalWizardStepContainer from "../../goalWizard/GoalWizardStepContainer";
import GoalWizardNavigation from "../../goalWizard/GoalWizardNavigation";
import StepIndicator from "./StepIndicator";

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
  type SyncStatus = "unsaved" | "saving" | "synced" | "error";
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("unsaved");
  const [syncMessage, setSyncMessage] = useState<string | undefined>(undefined);
  const debounceRef = React.useRef<boolean>(false);

  // Team mapping
  const homeTeamId = selectedFixtureData?.home_team?.__id__ ?? selectedFixtureData?.home_team_id ?? "";
  const awayTeamId = selectedFixtureData?.away_team?.__id__ ?? selectedFixtureData?.away_team_id ?? "";
  const homeTeamName = selectedFixtureData?.home_team?.name ?? 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name ?? 'Away Team';

  // Setup batchSave manager
  const batchSaveManager = useGlobalBatchSaveManager({
    homeTeamData: { id: homeTeamId, name: homeTeamName },
    awayTeamData: { id: awayTeamId, name: awayTeamName }
  });

  const resetWizard = () => {
    setCurrentStep('team');
    setWizardData({
      selectedTeam: null,
      selectedPlayer: null,
      isOwnGoal: false,
      needsAssist: false,
      assistPlayer: null
    });
    setSyncMessage(undefined);
    setSyncStatus("unsaved");
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

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
        if (wizardData.isOwnGoal) {
          setCurrentStep('goal-type');
        } else {
          setCurrentStep('assist');
        }
        break;
    }
  };

  function getStepTitle() {
    switch (currentStep) {
      case "team":
        return t("wizard.whichTeamScored", "Which team scored?");
      case "player":
        return t("wizard.selectGoalScorer", "Select Goal Scorer");
      case "goal-type":
        return t("wizard.confirmGoalType", "Confirm Goal Type");
      case "assist":
        return t("wizard.addAssist", "Add Assist (Optional)");
      case "confirm":
        return t("wizard.confirmGoalAssignment", "Confirm Goal Assignment");
      default:
        return "";
    }
  }

  const handleConfirm = async () => {
    if (debounceRef.current) return;
    debounceRef.current = true;
    setTimeout(() => { debounceRef.current = false; }, 1300);

    if (!wizardData.selectedPlayer || !wizardData.selectedTeam) {
      toast({
        title: t('wizard.missingFields', 'Missing Data'),
        description: t('wizard.missingFields', 'Please select both a player and team before confirming the goal.'),
        variant: "destructive"
      });
      setSyncStatus("error");
      setSyncMessage(t('wizard.missingFields', 'Missing required info.'));
      return;
    }

    setSyncStatus("saving");
    setSyncMessage(t('referee.saving', 'Saving changes to server...'));

    const scoringTeamId = wizardData.selectedTeam === 'home' ? homeTeamId : awayTeamId;

    // Check for duplicates
    const alreadyExists = goals.find(g =>
      g.playerId === wizardData.selectedPlayer.id &&
      g.time === matchTime &&
      g.teamId === scoringTeamId &&
      g.type === 'goal' &&
      Boolean(g.isOwnGoal) === Boolean(wizardData.isOwnGoal)
    );

    if (alreadyExists) {
      setSyncStatus("error");
      setSyncMessage(t('wizard.completed', 'Duplicate goal entry.'));
      toast({
        title: t('wizard.completed', 'Duplicate Goal'),
        description: t('wizard.completed', 'A goal for this player, time, and team already exists.'),
        variant: "destructive"
      });
      return;
    }

    // Add to local store
    const goalData = addGoal({
      playerId: wizardData.selectedPlayer.id,
      playerName: wizardData.selectedPlayer.name,
      teamId: scoringTeamId,
      teamName: wizardData.selectedTeam === 'home' ? homeTeamName : awayTeamName,
      type: 'goal' as const,
      time: matchTime,
      isOwnGoal: wizardData.isOwnGoal
    });

    if (!goalData) {
      setSyncStatus("error");
      setSyncMessage(t('wizard.completed', 'Duplicate detected (prevented).'));
      toast({
        title: t('wizard.completed', 'Duplicate Goal'),
        description: t('wizard.completed', 'A goal for this player, time, and team already exists.'),
        variant: "destructive"
      });
      return;
    }

    // Add assists (if present, not for own goal)
    if (!wizardData.isOwnGoal && wizardData.needsAssist && wizardData.assistPlayer) {
      addAssist({
        playerId: wizardData.assistPlayer.id,
        playerName: wizardData.assistPlayer.name,
        teamId: wizardData.assistPlayer.team === homeTeamName ? homeTeamId : awayTeamId,
        teamName: wizardData.assistPlayer.team,
        type: 'assist' as const,
        time: matchTime,
        isOwnGoal: false
      });
    }

    setSyncStatus("unsaved");
    setSyncMessage(t('wizard.completed', 'Goal added locally. Ready to save.'));

    toast({
      title: t('wizard.completed', 'Goal Added (Local)'),
      description: (
        <>
          {wizardData.selectedPlayer.name} ({goalData.teamName}) at {matchTime}s{wizardData.isOwnGoal ? ' (Own Goal)' : ''}.
          <br />
          <span className="font-semibold text-red-700">
            {t('wizard.completed', 'This change is not saved to the database yet!')}
          </span>
        </>
      ),
      variant: "destructive"
    });

    setCurrentStep("confirm");
  };

  const handleSaveNow = async () => {
    setSyncStatus("saving");
    setSyncMessage(t('referee.saving', 'Saving to database...'));
    try {
      const result = await batchSaveManager.batchSave();
      if (result.success) {
        setSyncStatus("synced");
        setSyncMessage(undefined);
        toast({
          title: t('wizard.completed', 'Changes Saved!'),
          description: t('wizard.completed', 'Goal(s) and all changes saved to the database.'),
          variant: "default"
        });
        setTimeout(() => {
          resetWizard();
          onClose();
        }, 900);
      } else {
        setSyncStatus("error");
        setSyncMessage(result.message || t('wizard.completed', 'Failed to save. Try again.'));
        toast({
          title: t('wizard.completed', 'Save Failed'),
          description: (result.message || t('wizard.completed', 'Failed to save changes.')),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setSyncStatus("error");
      setSyncMessage(error?.message ?? t('wizard.completed', 'Save error'));
      toast({
        title: t('wizard.completed', 'Save Failed'),
        description: error?.message ?? t('wizard.completed', 'Failed to save changes.'),
        variant: "destructive"
      });
    }
  };

  const isConfirmStep = currentStep === "confirm";
  const hasUnsaved = batchSaveManager.hasUnsavedChanges && (
    batchSaveManager.unsavedItemsCount.goals > 0 ||
    batchSaveManager.unsavedItemsCount.cards > 0 ||
    batchSaveManager.unsavedItemsCount.playerTimes > 0
  );

  return (
    <GoalWizardDialog open={isOpen} onOpenChange={handleClose}>
      <GoalWizardDialogContent className="sm:max-w-[500px]">
        <GoalWizardDialogHeader>
          <GoalWizardDialogTitle className="text-center">
            {getStepTitle()}
          </GoalWizardDialogTitle>
          
          {/* Step indicator */}
          <div className="mt-3">
            <StepIndicator currentStep={currentStep} isOwnGoal={wizardData.isOwnGoal} />
          </div>
        </GoalWizardDialogHeader>
        
        <div className="space-y-6">
          <GoalWizardStepContainer
            currentStep={currentStep}
            selectedFixtureData={selectedFixtureData}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
            wizardData={wizardData}
            onDataChange={handleDataChange}
            onNext={handleNext}
            onBack={handleBack}
            onConfirmGoal={handleConfirm}
            matchTime={matchTime}
          />

          {/* Enhanced warning after local score update */}
          {hasUnsaved && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-800 bg-red-50 border border-red-300 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span>
                <strong>{t('referee.unsavedChanges', 'Unsaved changes')}:</strong> {t('wizard.completed', 'You have local changes that haven\'t been saved to the database.')}<br />
                <b>{t('wizard.completed', 'Tap "Save & Sync Now" below to finalize!')}</b>
                <PulseDotBadge className="ml-2" />
              </span>
            </div>
          )}

          <GoalWizardNavigation
            isConfirmStep={isConfirmStep}
            syncStatus={syncStatus}
            syncMessage={syncMessage}
            hasUnsaved={hasUnsaved}
            canSave={batchSaveManager.hasUnsavedChanges}
            onConfirm={handleConfirm}
            onSaveNow={handleSaveNow}
            disableSave={
              syncStatus === "saving" ||
              syncStatus === "synced" ||
              !batchSaveManager.hasUnsavedChanges
            }
            isSaving={syncStatus === "saving"}
            isSynced={syncStatus === "synced"}
          />

          {/* Status indicator */}
          <GoalWizardSyncStatus status={syncStatus} message={syncMessage} />

          {batchSaveManager.hasUnsavedChanges && (
            <div className="text-xs text-gray-500 text-center">
              {t('referee.unsaved', 'Unsaved')}: {batchSaveManager.unsavedItemsCount.goals} {t('referee.goals', 'goals')}, {batchSaveManager.unsavedItemsCount.cards} {t('referee.cards', 'cards')}, {batchSaveManager.unsavedItemsCount.playerTimes} {t('referee.playerTimes', 'player times')}
            </div>
          )}
        </div>
      </GoalWizardDialogContent>
    </GoalWizardDialog>
  );
};

export default GoalWizard;
