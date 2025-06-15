
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface GoalWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isEditMode?: boolean;
  displayTime?: string;
  children: React.ReactNode;
}

const GoalWizardDialog = ({
  isOpen,
  onClose,
  title,
  isEditMode = false,
  displayTime,
  children
}: GoalWizardDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg sm:text-xl text-center flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>{title}</span>
            {displayTime && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {displayTime}
              </Badge>
            )}
          </DialogTitle>
          
          {isEditMode && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-sm font-medium text-orange-800">
                Editing Mode Active
              </div>
              <div className="text-xs text-orange-700 mt-1">
                You are modifying an existing goal entry
              </div>
            </div>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalWizardDialog;
