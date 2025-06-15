
import React from "react";
import UnsavedChangesIndicator from "./UnsavedChangesIndicator";

interface Props {
  hasUnsavedChanges: boolean;
  unsavedItemsCount: number;
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
