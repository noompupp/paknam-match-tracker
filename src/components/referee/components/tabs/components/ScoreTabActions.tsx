
import React from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";

interface QuickGoal {
  id: number | string;
  event_time?: number;
  time?: number;
  team_id?: string;
  teamId?: string;
  teamName?: string;
  team?: 'home' | 'away';
  description?: string;
  created_at?: string;
  playerName?: string;
}

interface ScoreTabActionsProps {
  unassignedGoalsCount: number;
  isProcessingQuickGoal: boolean;
  onQuickGoalClick: () => void;
  onFullGoalEntryClick: () => void;
  onAddDetailsToGoalsClick: () => void;
  children: React.ReactNode;
}

const ScoreTabActions = ({
  unassignedGoalsCount,
  isProcessingQuickGoal,
  onQuickGoalClick,
  onFullGoalEntryClick,
  onAddDetailsToGoalsClick,
  children
}: ScoreTabActionsProps) => {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
};

export default ScoreTabActions;
