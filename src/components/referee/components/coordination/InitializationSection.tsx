
import React from 'react';
import { Button } from "@/components/ui/button";

interface InitializationSectionProps {
  onInitialize: () => void;
  isLoading: boolean;
}

const InitializationSection = ({ onInitialize, isLoading }: InitializationSectionProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">Initialize multi-referee coordination for this match</p>
      <Button 
        onClick={onInitialize} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Initializing...' : 'Initialize Coordination'}
      </Button>
    </div>
  );
};

export default InitializationSection;
