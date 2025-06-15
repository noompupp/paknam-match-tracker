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
import GoalWizardSyncStatus from "./GoalWizardSyncStatus";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import PulseDotBadge from "@/components/ui/PulseDotBadge";

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
  // --- New state for sync status:
  type SyncStatus = "unsaved" | "saving" | "synced" | "error";
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("unsaved");
  const [syncMessage, setSyncMessage] = useState<string | undefined>(undefined);
  // Debounce flag for duplicate prevention
  const debounceRef = React.useRef<boolean>(false);
  // Validate team info for batchSave
  const homeTeamId = selectedFixtureData?.home_team?.__id__ ?? selectedFixtureData?.home_team_id;
  const awayTeamId = selectedFixtureData?.away_team?.__id__ ?? selectedFixtureData?.away_team_id;
  const homeTeamName = selectedFixtureData?.home_team?.name ?? 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name ?? 'Away Team';

  // Setup batchSave manager (single-shot usage)
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

  // ---- Updated handleConfirm logic ----
  const handleConfirm = async () => {
    if (debounceRef.current) return; // Prevent rapid-fire
    debounceRef.current = true;
    setTimeout(() => { debounceRef.current = false; }, 1300);

    if (!wizardData.selectedPlayer || !wizardData.selectedTeam) {
      toast({
        title: "Missing Data",
        description: "Please select both a player and team before confirming the goal.",
        variant: "destructive"
      });
      setSyncStatus("error");
      setSyncMessage("Missing required info.");
      return;
    }

    setSyncStatus("saving");
    setSyncMessage("Registering local goal...");

    const beneficiaryTeamId = wizardData.selectedTeam === 'home' ? homeTeamId : awayTeamId;
    // Prevent duplicate (client-side) BEFORE addGoal (race-safe)
    const alreadyExists = goals.find(g =>
      g.playerId === wizardData.selectedPlayer.id &&
      g.time === matchTime &&
      g.teamId === (wizardData.selectedPlayer.team === homeTeamName ? homeTeamId : awayTeamId) &&
      g.type === 'goal' &&
      Boolean(g.isOwnGoal) === Boolean(wizardData.isOwnGoal)
    );

    if (alreadyExists) {
      setSyncStatus("error");
      setSyncMessage("Duplicate goal entry.");
      toast({
        title: "Duplicate Goal",
        description: "A goal for this player, time, and team already exists.",
        variant: "destructive"
      });
      return;
    }

    // Add to local store ("unsaved changes" state)
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
      setSyncStatus("error");
      setSyncMessage("Duplicate detected (prevented).");
      toast({
        title: "Duplicate Goal",
        description: "A goal for this player, time, and team already exists.",
        variant: "destructive"
      });
      return;
    }

    // (Assists)
    if (!wizardData.isOwnGoal && wizardData.needsAssist && wizardData.assistPlayer) {
      addAssist({
        playerId: wizardData.assistPlayer.id,
        playerName: wizardData.assistPlayer.name,
        teamId: wizardData.assistPlayer.team === homeTeamName ? homeTeamId : awayTeamId,
        teamName: wizardData.assistPlayer.team,
        type: 'assist' as const,
        time: matchTime,
        isOwnGoal: false // Assists cannot be own goals
      });
    }

    setSyncStatus("unsaved");
    setSyncMessage("Goal added locally. Ready to save.");

    toast({
      title: "Goal Added",
      description: `${wizardData.selectedPlayer.name} (${goalData.teamName}) at ${matchTime}s${wizardData.isOwnGoal ? ' (Own Goal)' : ''}. Click 'Save & Sync Now' below!`,
      variant: "default"
    });

    // Optionally auto-advance, auto-close, etc.
    setCurrentStep("confirm");
  };

  // ---- Save Now to DB (batchSave) ----
  const handleSaveNow = async () => {
    setSyncStatus("saving");
    setSyncMessage("Saving to database...");
    try {
      const result = await batchSaveManager.batchSave();
      if (result.success) {
        setSyncStatus("synced");
        setSyncMessage(undefined);
        toast({
          title: "Changes Saved",
          description: "Goal(s) and all changes successfully saved to the database.",
          variant: "default"
        });
        // Optionally briefly animate and then reset the wizard
        setTimeout(() => {
          resetWizard();
          onClose();
        }, 900);
      } else {
        setSyncStatus("error");
        setSyncMessage(
          result.message || "Failed to save. Try again."
        );
        toast({
          title: "Save Failed",
          description: (result.message || "Failed to save changes."),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setSyncStatus("error");
      setSyncMessage(error?.message ?? "Save error");
      toast({
        title: "Save Failed",
        description: error?.message ?? "Failed to save changes.",
        variant: "destructive"
      });
    }
  };

  // ---- Render ----
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

  // ---- Next/DB save button in confirm step ----
  const isConfirmStep = currentStep === "confirm";
  const hasUnsaved = batchSaveManager.hasUnsavedChanges && (
    batchSaveManager.unsavedItemsCount.goals > 0 ||
    batchSaveManager.unsavedItemsCount.cards > 0 ||
    batchSaveManager.unsavedItemsCount.playerTimes > 0
  );

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
        {/* Confirmation Step: Save Button (add DB save now) */}
        {isConfirmStep && (
          <div className="mt-4 flex flex-col gap-2">
            {/* Save to Local Store (Goal) Button */}
            <button
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60 flex items-center justify-center gap-2 font-semibold"
              onClick={handleConfirm}
              disabled={syncStatus === "saving"}
              type="button"
              style={{ marginBottom: 0 }}
            >
              {syncStatus === "saving" ? (
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <span>
                  Save Goal (Local)
                  {hasUnsaved && <span className="ml-2 align-middle"><PulseDotBadge /></span>}
                </span>
              )}
            </button>
            {/* Save & Sync button (save all changes, batchSave) */}
            <button
              className={`w-full flex items-center justify-center gap-2 font-semibold py-2 rounded transition-colors ${syncStatus === "saving" || syncStatus === "synced"
                ? "bg-green-300 text-white"
                : hasUnsaved
                ? "bg-red-600 text-white animate-pulse"
                : "bg-green-600 text-white"
              }`}
              onClick={handleSaveNow}
              disabled={
                syncStatus === "saving" ||
                syncStatus === "synced" ||
                !batchSaveManager.hasUnsavedChanges
              }
              type="button"
            >
              {syncStatus === "saving" ? (
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>
                    {syncStatus === "synced"
                      ? "Saved"
                      : batchSaveManager.hasUnsavedChanges
                      ? "Save & Sync Now"
                      : "No Unsaved Changes"}
                  </span>
                  {hasUnsaved && <span className="ml-2 align-middle"><PulseDotBadge /></span>}
                </>
              )}
            </button>
            {/* Visual status & database indicator */}
            <GoalWizardSyncStatus status={syncStatus} message={syncMessage} />
            {/* If there are unsaved items, show counts */}
            {batchSaveManager.hasUnsavedChanges && (
              <div className="text-xs text-gray-500 mt-1">
                Unsaved: {batchSaveManager.unsavedItemsCount.goals} goals, {batchSaveManager.unsavedItemsCount.cards} cards, {batchSaveManager.unsavedItemsCount.playerTimes} pl. times
              </div>
            )}
            {/* Big warning if unsaved */}
            {hasUnsaved && (
              <div className="w-full text-xs text-center text-red-700 bg-red-50 rounded border border-red-200 mt-2 p-1 font-semibold animate-pulse">
                Unsaved changes! Be sure to sync to database for safe keeping.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoalWizard;
