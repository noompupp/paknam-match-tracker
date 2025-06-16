
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface GoalWizardNavigationProps {
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

const GoalWizardNavigation = ({
  isConfirmStep,
  syncStatus,
  syncMessage,
  hasUnsaved,
  canSave,
  onConfirm,
  onSaveNow,
  disableSave,
  isSaving,
  isSynced
}: GoalWizardNavigationProps) => {
  const { t } = useTranslation();

  if (!isConfirmStep) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 pt-4 border-t">
      {/* Primary action - Add Goal (local) */}
      <Button 
        onClick={onConfirm} 
        className="w-full" 
        size="lg"
        disabled={isSaving || isSynced}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('referee.saving', 'Saving...')}
          </>
        ) : isSynced ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('wizard.completed', 'Goal recorded successfully')}
          </>
        ) : (
          t('wizard.confirmAndSaveGoal', 'Confirm & Save Goal')
        )}
      </Button>

      {/* Secondary action - Save to database */}
      {hasUnsaved && canSave && (
        <Button 
          onClick={onSaveNow}
          variant="outline"
          className="w-full"
          disabled={disableSave}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('referee.saving', 'Saving...')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('referee.save', 'Save & Sync Now')}
            </>
          )}
        </Button>
      )}

      {/* Status message */}
      {syncMessage && (
        <div className={`text-xs text-center p-2 rounded ${
          syncStatus === 'error' ? 'text-red-600 bg-red-50' :
          syncStatus === 'saving' ? 'text-blue-600 bg-blue-50' :
          syncStatus === 'synced' ? 'text-green-600 bg-green-50' :
          'text-gray-600 bg-gray-50'
        }`}>
          {syncMessage}
        </div>
      )}
    </div>
  );
};

export default GoalWizardNavigation;
