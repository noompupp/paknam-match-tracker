
import React from "react";
import ResetMatchConfirmationDialog from "@/components/referee/components/ResetMatchConfirmationDialog";

export const useResetConfirmationDialog = () => {
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [resetDialogWarnings, setResetDialogWarnings] = React.useState<string[]>([]);
  const [resetDialogPromise, setResetDialogPromise] = React.useState<{
    resolve: (confirmed: boolean) => void;
    reject: (err: any) => void;
  } | null>(null);
  const [resetDialogLoading, setResetDialogLoading] = React.useState(false);

  const showResetDialog = (warnings?: string[]): Promise<boolean> => {
    setResetDialogWarnings(warnings || []);
    setResetDialogOpen(true);
    setResetDialogLoading(false);
    return new Promise((resolve, reject) => {
      setResetDialogPromise({ resolve, reject });
    });
  };

  const handleCancel = () => {
    setResetDialogOpen(false);
    setResetDialogLoading(false);
    resetDialogPromise?.resolve(false);
    setResetDialogPromise(null);
  };

  const handleConfirm = () => {
    setResetDialogLoading(true);
    setResetDialogOpen(false);
    resetDialogPromise?.resolve(true);
    setResetDialogPromise(null);
  };

  const ResetDialog = (
    <ResetMatchConfirmationDialog
      open={resetDialogOpen}
      warningLines={resetDialogWarnings}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      loading={resetDialogLoading}
    />
  );

  return { showResetDialog, ResetDialog };
};
