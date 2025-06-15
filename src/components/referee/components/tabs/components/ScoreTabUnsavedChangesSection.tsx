
import React from "react";
import UnsavedChangesIndicator from "./UnsavedChangesIndicator";

interface UnsavedItemsCount {
  goals: number;
  cards: number;
  playerTimes: number;
}

interface Props {
  hasUnsavedChanges: boolean;
  unsavedItemsCount: UnsavedItemsCount;
  onSave: () => void;
  onSaveGoals?: () => void;
  isSaving?: boolean;
  isGoalsSaving?: boolean;
}

const ScoreTabUnsavedChangesSection = ({
  hasUnsavedChanges,
  unsavedItemsCount,
  onSave,
  onSaveGoals,
  isSaving,
  isGoalsSaving,
}: Props) => (
  <UnsavedChangesIndicator
    hasUnsavedChanges={hasUnsavedChanges}
    unsavedItemsCount={unsavedItemsCount}
    onSave={onSave}
    onSaveGoals={onSaveGoals}
    isSaving={isSaving}
    isGoalsSaving={isGoalsSaving}
  />
);

export default ScoreTabUnsavedChangesSection;
