
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
        title: "Unsaved Changes ⚠️",
        description: `You have ${unsavedItemsCount.goals} unsaved goal(s), ${unsavedItemsCount.cards} card(s), and ${unsavedItemsCount.playerTimes} player time(s). Please save your work!`,
        variant: "destructive"
      });
    }
  }, [
    hasUnsavedChanges,
    unsavedItemsCount.goals,
    unsavedItemsCount.cards,
    unsavedItemsCount.playerTimes,
    toast
  ]);

  return (
    <UnsavedChangesIndicator
      hasUnsavedChanges={hasUnsavedChanges}
      unsavedItemsCount={unsavedItemsCount}
      onSave={onSave}
    />
  );
};

export default ScoreTabUnsavedChangesSection;
