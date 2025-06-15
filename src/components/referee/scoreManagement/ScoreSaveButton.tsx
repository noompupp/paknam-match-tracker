
import React from "react";
import { Button } from "@/components/ui/button";
import PulseDotBadge from "@/components/ui/PulseDotBadge";

interface SaveButtonProps {
  onClick: () => void;
  className?: string;
  disabled: boolean;
  text: string;
  hasUnsaved: boolean;
  icon: React.ElementType;
  variant: 'default' | 'secondary' | 'destructive';
}

const ScoreSaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  className,
  disabled,
  text,
  hasUnsaved,
  icon: Icon,
  variant,
}) => (
  <Button 
    onClick={onClick}
    className={`w-full relative ${className || ""}`}
    disabled={disabled}
    variant={variant}
  >
    <Icon className="h-4 w-4 mr-2" />
    {text}
    {hasUnsaved && (
      <span className="ml-2">
        <PulseDotBadge />
      </span>
    )}
  </Button>
);

export default ScoreSaveButton;
