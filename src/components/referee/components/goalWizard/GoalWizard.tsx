
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
import GoalWizardStepContainer from "../../goalWizard/GoalWizardStepContainer";
import GoalWizardNavigation from "../../goalWizard/GoalWizardNavigation";
import { AlertTriangle } from "lucide-react";

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

  // Robust team mapping
  const homeTeamId =
    selectedFixtureData?.home_team?.__id__ ??
    selectedFixtureData?.home_team_id ??
    selectedFixtureData?.home_team_id?.toString?.() ??
    "";
  const awayTeamId =
    selectedFixtureData?.away_team?.__id__ ??
    selectedFixtureData?.away_team_id ??
    selectedFixtureData?.away_team_id?.toString?.() ??
    "";
  const homeTeamName = selectedFixtureData?.home_team?.name ?? 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name ?? 'Away Team';

  // Setup batchSave manager for unsaved warning
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
        return t("Which team scored?") || "Which team scored?";
      case "player":
        return t("Select Goal Scorer") || "Select Goal Scorer";
      case "goal-type":
        return t("Confirm Goal Type") || "Confirm Goal Type";
      case "assist":
        return t("Was there an assist?") || "Was there an assist?";
      case "confirm":
        return t("Confirm Goal Assignment") || "Confirm Goal Assignment";
      default:
        return "";
    }
  }

  // --- Enhanced handleConfirm: robust team mapping + strong unsaved feedback ---
  const handleConfirm = async () => {
    if (debounceRef.current) return;
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

    const scoringTeamId =
      wizardData.selectedTeam === 'home'
        ? homeTeamId
        : awayTeamId;

    // Ensure no duplicate
    const alreadyExists = goals.find(g =>
      g.playerId === wizardData.selectedPlayer.id &&
      g.time === matchTime &&
      g.teamId === scoringTeamId &&
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
      setSyncMessage("Duplicate detected (prevented).");
      toast({
        title: "Duplicate Goal",
        description: "A goal for this player, time, and team already exists.",
        variant: "destructive"
      });
      return;
    }

    // Assists (if present, not for own goal)
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
    setSyncMessage("Goal added locally. Ready to save.");

    // STRONGER toast for unsaved
    toast({
      title: "Goal Added (Local)",
      description: (
        <>
          {wizardData.selectedPlayer.name} ({goalData.teamName}) at {matchTime}s{wizardData.isOwnGoal ? ' (Own Goal)' : ''}.
          <br />
          <span className="font-semibold text-red-700">
            This change is <u>not saved</u> to the database yet!
          </span>
        </>
      ),
      variant: "destructive"
    });

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
          title: "Changes Saved!",
          description: "Goal(s) and all changes saved to the database.",
          variant: "default"
        });
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
        </div>

        {/* Enhanced warning after local score update */}
        {hasUnsaved && (
          <div className="flex items-center gap-2 mt-2 px-2 py-2 text-xs text-red-800 bg-red-50 border border-red-300 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>
              <strong>Unsaved changes:</strong> You have local changes that haven&#39;t been saved to the database.
              <br />
              <b>Tap "Save &amp; Sync Now" below to finalize!</b>
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

        {/* Visual status & database indicator */}
        <GoalWizardSyncStatus status={syncStatus} message={syncMessage} />

        {batchSaveManager.hasUnsavedChanges && (
          <div className="text-xs text-gray-500 mt-1">
            Unsaved: {batchSaveManager.unsavedItemsCount.goals} goals, {batchSaveManager.unsavedItemsCount.cards} cards, {batchSaveManager.unsavedItemsCount.playerTimes} pl. times
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoalWizard;
