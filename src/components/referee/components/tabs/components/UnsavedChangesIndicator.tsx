
import { Save, AlertTriangle, CheckCircle } from "lucide-react";
import RefereeCard from "../../../shared/RefereeCard";
import SaveGoalsButton from "../../shared/SaveGoalsButton"; // absolute import within tabs -> shared
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

// Only rendering for UnsavedChangesIndicator context. 
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

  // There are unsaved goals, but *no* unsaved cards/times
  const goalsOnlyUnsaved =
    unsavedItemsCount.goals > 0 &&
    unsavedItemsCount.cards === 0 &&
    unsavedItemsCount.playerTimes === 0;

  // If there are any unsaved cards or playerTimes (with or without goals)
  const anyNonGoalUnsaved =
    unsavedItemsCount.cards > 0 ||
    unsavedItemsCount.playerTimes > 0;

  // If there are NO unsaved changes, message only!
  if (!hasUnsavedChanges || totalUnsaved === 0) {
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

  // If ONLY goals are unsaved, show Save Goals button
  if (goalsOnlyUnsaved && onSaveGoals) {
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
                {unsavedItemsCount.goals} unsaved goal
                {unsavedItemsCount.goals !== 1 ? "s" : ""}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-500">
                {unsavedItemsCount.goals > 0 && `${unsavedItemsCount.goals} goals`}
              </div>
            </div>
          </div>
          <SaveGoalsButton
            onSaveGoals={onSaveGoals}
            isLoading={isGoalsSaving}
            size="sm"
          >
            Save Goals
          </SaveGoalsButton>
        </div>
      </RefereeCard>
    );
  }

  // If there are any cards or playerTimes unsaved, just show "Changes Pending" (no Finish/Exit or Save button here)
  if (anyNonGoalUnsaved) {
    return (
      <RefereeCard
        variant="compact"
        className="bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800"
      >
        <div className="flex items-center gap-3 p-3">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <div>
            <div className="text-sm font-medium text-orange-800 dark:text-orange-400">
              {totalUnsaved} unsaved change{totalUnsaved !== 1 ? "s" : ""}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-500">
              {unsavedItemsCount.goals > 0 && `${unsavedItemsCount.goals} goals `}
              {unsavedItemsCount.cards > 0 && `${unsavedItemsCount.cards} cards `}
              {unsavedItemsCount.playerTimes > 0 && `${unsavedItemsCount.playerTimes} times`}
            </div>
          </div>
          {/* No buttons shown for mixed unsaved, as instructed */}
        </div>
      </RefereeCard>
    );
  }

  // Fallback: never show Finish/Exit or Save button here
  return null;
};

export default UnsavedChangesIndicator;
