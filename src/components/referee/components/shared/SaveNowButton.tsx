
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface SaveNowButtonProps {
  onSave: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

const SaveNowButton = ({ 
  onSave, 
  isLoading = false, 
  disabled = false,
  variant = 'default',
  size = 'default'
}: SaveNowButtonProps) => {
  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  };

  return (
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
      {isLoading ? 'Saving...' : 'Save Now'}
    </Button>
  );
};

export default SaveNowButton;
