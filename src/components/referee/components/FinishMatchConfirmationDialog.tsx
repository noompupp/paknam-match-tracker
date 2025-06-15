
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
import { checkCircle } from "lucide-react";

interface FinishMatchConfirmationDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const emphasizeStyles =
  "bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/50";

const FinishMatchConfirmationDialog = ({
  open,
  onCancel,
  onConfirm,
  loading = false,
}: FinishMatchConfirmationDialogProps) => (
  <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <span>
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} fill="none" />
            </svg>
          </span>
          <AlertDialogTitle>
            Finish &amp; Exit This Match
          </AlertDialogTitle>
        </div>
        <AlertDialogDescription asChild>
          <div>
            <div className="mb-4">
              <b>Are you sure you want to finalize and exit?</b><br />
              This will:
            </div>
            <ul className="list-disc pl-6 mb-2 space-y-1 text-left">
              <li>Save all current match data and events</li>
              <li>Mark the match as <b>completed</b></li>
              <li>Prevent further edits to this fixture</li>
              <li>Return you to the dashboard</li>
            </ul>
            <div>This action is recommended <b>after all details are complete</b> for official reporting.</div>
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
          className={emphasizeStyles}
          onClick={onConfirm}
          disabled={loading}
          autoFocus
        >
          {loading ? "Finalizing..." : "Finish & Exit"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default FinishMatchConfirmationDialog;
