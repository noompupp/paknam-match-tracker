
import { Save, AlertTriangle, CheckCircle } from "lucide-react";

export const useScoreSaveConfig = ({
  isPending,
  isValid,
  isMatchComplete,
  hasScoreChange,
  hasUnsaved,
  unsavedItemsCount,
}: {
  isPending: boolean;
  isValid: boolean;
  isMatchComplete: boolean;
  hasScoreChange: boolean;
  hasUnsaved: boolean;
  unsavedItemsCount: { goals: number; cards: number; playerTimes: number };
}) => {
  if (isPending) {
    return {
      disabled: true,
      variant: "default" as const,
      icon: Save,
      text: "Saving Match...",
      className: "bg-blue-500 hover:bg-blue-600"
    };
  }

  if (!isValid) {
    return {
      disabled: true,
      variant: "destructive" as const,
      icon: AlertTriangle,
      text: "Invalid Match Data",
      className: ""
    };
  }

  if (isMatchComplete && !hasScoreChange) {
    return {
      disabled: true,
      variant: "secondary" as const,
      icon: CheckCircle,
      text: "Match Already Saved",
      className: "bg-green-100 text-green-700 border-green-300"
    };
  }

  if (hasScoreChange || !isMatchComplete || hasUnsaved) {
    return {
      disabled: false,
      variant: hasUnsaved ? "destructive" as const : "default" as const,
      icon: Save,
      text: hasUnsaved
        ? `Save Now (${unsavedItemsCount.goals + unsavedItemsCount.cards + unsavedItemsCount.playerTimes})`
        : hasScoreChange
        ? "Save Changes"
        : "Save Match Result",
      className: hasUnsaved
        ? "bg-red-600 hover:bg-red-700 ring-2 ring-red-300 animate-pulse"
        : "bg-green-600 hover:bg-green-700"
    };
  }

  return {
    disabled: true,
    variant: "secondary" as const,
    icon: AlertTriangle,
    text: "No Changes to Save",
    className: ""
  };
};
