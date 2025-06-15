
import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ResetMatchConfirmationDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  warningLines?: string[];
  loading?: boolean;
}

const dangerStyles =
  "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400";

export const ResetMatchConfirmationDialog = ({
  open,
  onCancel,
  onConfirm,
  warningLines = [],
  loading = false,
}: ResetMatchConfirmationDialogProps) => (
  <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <AlertDialogTitle>
            Reset Match Data
          </AlertDialogTitle>
        </div>
        <AlertDialogDescription asChild>
          <div>
            <div className="mb-4">
              This action <b>cannot be undone</b>. Resetting match data will:
            </div>
            <ul className="list-disc pl-6 mb-2 space-y-1 text-left">
              <li>Delete all match events (goals, cards, etc.)</li>
              <li>Delete all player time tracking records</li>
              <li>Reset fixture scores to <span className="font-bold">0-0</span></li>
              <li>Clear all local and server match state</li>
            </ul>
            {warningLines.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-300 text-yellow-800 p-2 rounded mb-2">
                <b>Warnings:</b>
                <ul className="list-disc pl-5">
                  {warningLines.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              Are you <span className="font-semibold">absolutely sure</span> you want to reset <span className="text-red-600 font-semibold">all match data</span> for this fixture?
            </div>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          className={dangerStyles}
          onClick={onConfirm}
          disabled={loading}
          autoFocus
        >
          {loading ? "Resetting..." : "Yes, Reset Data"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ResetMatchConfirmationDialog;
