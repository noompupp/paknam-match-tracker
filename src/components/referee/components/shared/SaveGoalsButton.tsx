
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface SaveGoalsButtonProps {
  onSaveGoals: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  children?: React.ReactNode;
}

const SaveGoalsButton = ({
  onSaveGoals,
  isLoading = false,
  disabled = false,
  size = "default",
  children
}: SaveGoalsButtonProps) => {
  const handleClick = async () => {
    console.log('[SaveGoalsButton] Save button clicked!');
    await onSaveGoals();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant="default"
      size={size}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {children || (isLoading ? "Saving Goals..." : "Save Goals")}
    </Button>
  );
};

export default SaveGoalsButton;
