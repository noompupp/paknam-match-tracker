
import React from "react";
import PulseDotBadge from "@/components/ui/PulseDotBadge";

interface NavigationProps {
  isConfirmStep: boolean;
  syncStatus: "unsaved" | "saving" | "synced" | "error";
  syncMessage?: string;
  hasUnsaved: boolean;
  canSave: boolean;
  onConfirm: () => void;
  onSaveNow: () => void;
  disableSave: boolean;
  isSaving: boolean;
  isSynced: boolean;
}

const GoalWizardNavigation: React.FC<NavigationProps> = ({
  isConfirmStep,
  syncStatus,
  syncMessage,
  hasUnsaved,
  canSave,
  onConfirm,
  onSaveNow,
  disableSave,
  isSaving,
  isSynced,
}) =>
  isConfirmStep ? (
    <div className="mt-4 flex flex-col gap-2">
      <button
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60 flex items-center justify-center gap-2 font-semibold"
        onClick={onConfirm}
        disabled={isSaving}
        type="button"
        style={{ marginBottom: 0 }}
      >
        {isSaving ? (
          <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <span>
            Save Goal (Local)
            {hasUnsaved && <span className="ml-2 align-middle"><PulseDotBadge /></span>}
          </span>
        )}
      </button>
      <button
        className={`w-full flex items-center justify-center gap-2 font-semibold py-2 rounded transition-colors ${isSaving || isSynced
          ? "bg-green-300 text-white"
          : hasUnsaved
          ? "bg-red-600 text-white animate-pulse"
          : "bg-green-600 text-white"
        }`}
        onClick={onSaveNow}
        disabled={disableSave}
        type="button"
      >
        {isSaving ? (
          <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <>
            <span>
              {isSynced
                ? "Saved"
                : hasUnsaved
                ? "Save & Sync Now"
                : "No Unsaved Changes"}
            </span>
            {hasUnsaved && <span className="ml-2 align-middle"><PulseDotBadge /></span>}
          </>
        )}
      </button>
      {/* Additional status/indicators can be slotted in by parent */}
    </div>
  ) : null;

export default GoalWizardNavigation;
