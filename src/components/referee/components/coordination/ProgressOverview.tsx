
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ProgressOverviewProps {
  progressPercentage: number;
}

const ProgressOverview = ({ progressPercentage }: ProgressOverviewProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Overall Progress</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} className="w-full" />
    </div>
  );
};

export default ProgressOverview;
