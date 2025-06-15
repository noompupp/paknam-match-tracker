
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface SaveNowButtonProps {
  onSave: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  children?: React.ReactNode;
  label?: string; // New optional label for button text
  disclaimer?: string; // New optional disclaimer message
}

const SaveNowButton = ({ 
  onSave, 
  isLoading = false, 
  disabled = false,
  variant = 'default',
  size = 'default',
  children,
  label = undefined,
  disclaimer = undefined
}: SaveNowButtonProps) => {
  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <Button
        onClick={handleSave}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {children || label || (isLoading ? 'Saving...' : 'Save Now')}
      </Button>
      {disclaimer && (
        <p className="text-xs text-orange-600 mt-1 italic">{disclaimer}</p>
      )}
    </div>
  );
};

export default SaveNowButton;
