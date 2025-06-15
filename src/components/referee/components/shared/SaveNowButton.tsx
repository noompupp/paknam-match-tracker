
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaveNowButtonProps {
  onSave: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  children?: React.ReactNode;
  hasUnsaved?: boolean;
}

const SaveNowButton = ({ 
  onSave, 
  isLoading = false, 
  disabled = false,
  variant = 'default',
  size = 'default',
  children,
  hasUnsaved = false
}: SaveNowButtonProps) => {
  const { toast } = useToast();
  const handleSave = async () => {
    try {
      await onSave();
      toast({
        title: "Changes Saved",
        description: "All unsaved changes have been saved to the database.",
        variant: "default"
      });
    } catch (error) {
      console.error('Save operation failed:', error);
      toast({
        title: "Save Failed",
        description: "Saving changes failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 relative ${hasUnsaved ? "ring-2 ring-red-400 animate-pulse" : ""}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {children || (isLoading ? 'Saving...' : 'Save Now')}
      {hasUnsaved && (
        <AlertTriangle className="h-4 w-4 text-red-600 absolute right-2" title="Unsaved changes" />
      )}
    </Button>
  );
};

export default SaveNowButton;
