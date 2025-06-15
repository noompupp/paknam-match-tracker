
import React from "react";
import UnsavedChangesIndicator from "./UnsavedChangesIndicator";
import { useToast } from "@/hooks/use-toast";

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
}: Props) => {
  const { toast } = useToast();

  React.useEffect(() => {
    if (hasUnsavedChanges && (unsavedItemsCount.goals > 0 || unsavedItemsCount.cards > 0 || unsavedItemsCount.playerTimes > 0)) {
      toast({
        title: "Attention",
        description: "You have unsaved changes. Click “Save Now” to write them to the database!",
        variant: "destructive"
      });
    }
  }, [hasUnsavedChanges, unsavedItemsCount, toast]);

  return (
    <UnsavedChangesIndicator
      hasUnsavedChanges={hasUnsavedChanges}
      unsavedItemsCount={unsavedItemsCount}
      onSave={onSave}
    />
  );
};

export default ScoreTabUnsavedChangesSection;
