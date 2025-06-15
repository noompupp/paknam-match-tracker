import { Save, AlertTriangle, CheckCircle } from "lucide-react";
import RefereeCard from "../../../shared/RefereeCard";
import RefereeButton from "../../../shared/RefereeButton";
import SaveGoalsButton from "../../../shared/SaveGoalsButton";
import { cn } from "@/lib/utils";

interface UnsavedChangesIndicatorProps {
  hasUnsavedChanges: boolean;
  unsavedItemsCount: {
    goals: number;
    cards: number;
    playerTimes: number;
  };
  onSave: () => void;
  onSaveGoals?: () => void;
  isSaving?: boolean;
  isGoalsSaving?: boolean;
}

const UnsavedChangesIndicator = ({
  hasUnsavedChanges,
  unsavedItemsCount,
  onSave,
  onSaveGoals,
  isSaving = false,
  isGoalsSaving = false,
}: UnsavedChangesIndicatorProps) => {
  const totalUnsaved =
    unsavedItemsCount.goals +
    unsavedItemsCount.cards +
    unsavedItemsCount.playerTimes;

  // Only unsaved goals and nothing else
  const goalsOnly =
    unsavedItemsCount.goals > 0 &&
    unsavedItemsCount.cards === 0 &&
    unsavedItemsCount.playerTimes === 0;

  // Other unsaved items (cards or playerTimes)
  const mixedUnsaved =
    unsavedItemsCount.cards > 0 ||
    unsavedItemsCount.playerTimes > 0;

  if (!hasUnsavedChanges) {
    return (
      <RefereeCard
        variant="compact"
        className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
      >
        <div className="flex items-center gap-3 p-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800 dark:text-green-400">
            All changes saved to database
          </span>
        </div>
      </RefereeCard>
    );
  }

  return (
    <RefereeCard
      variant="compact"
      className="bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800"
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <div>
            <div className="text-sm font-medium text-orange-800 dark:text-orange-400">
              {totalUnsaved} unsaved change{totalUnsaved !== 1 ? "s" : ""}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-500">
              {unsavedItemsCount.goals > 0 && `${unsavedItemsCount.goals} goals `}
              {unsavedItemsCount.cards > 0 && `${unsavedItemsCount.cards} cards `}
              {unsavedItemsCount.playerTimes > 0 &&
                `${unsavedItemsCount.playerTimes} times`}
            </div>
          </div>
        </div>
        {goalsOnly && onSaveGoals ? (
          <SaveGoalsButton
            onSaveGoals={onSaveGoals}
            isLoading={isGoalsSaving}
            size="sm"
          >
            Save Goals
          </SaveGoalsButton>
        ) : (
          <RefereeButton
            onClick={onSave}
            loading={isSaving}
            variant="default"
            size="sm"
            icon={<Save className="h-4 w-4" />}
          >
            {mixedUnsaved
              ? "Save All Changes"
              : "Finish & Exit"}
          </RefereeButton>
        )}
      </div>
    </RefereeCard>
  );
};

export default UnsavedChangesIndicator;
