
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
}

const ScoreTabUnsavedChangesSection = ({
  hasUnsavedChanges,
  unsavedItemsCount,
  onSave,
}: Props) => (
  <UnsavedChangesIndicator
    hasUnsavedChanges={hasUnsavedChanges}
    unsavedItemsCount={unsavedItemsCount}
    onSave={onSave}
  />
);

export default ScoreTabUnsavedChangesSection;
