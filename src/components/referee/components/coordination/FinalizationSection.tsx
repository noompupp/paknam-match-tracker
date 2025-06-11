
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface FinalizationSectionProps {
  onFinalize: () => void;
  isLoading: boolean;
}

const FinalizationSection = ({ onFinalize, isLoading }: FinalizationSectionProps) => {
  return (
    <div className="pt-4 border-t">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/10 dark:border-green-800">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-800 dark:text-green-400">Ready for Finalization</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-500 mb-3">
          All referee tasks have been completed. You can now finalize the match.
        </p>
        <Button 
          onClick={onFinalize}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Finalizing...' : 'Finalize Match'}
        </Button>
      </div>
    </div>
  );
};

export default FinalizationSection;
