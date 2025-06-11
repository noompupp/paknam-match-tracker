
import React from 'react';
import { Target, Users } from 'lucide-react';

interface GoalDisplayProps {
  goal: {
    playerName: string;
    team: string;
    time: number;
    type: 'goal' | 'assist';
    assistPlayerName?: string;
    isOwnGoal?: boolean;
  };
  formatTime: (seconds: number) => string;
  teamColor?: string;
}

const GoalDisplay = ({ goal, formatTime, teamColor }: GoalDisplayProps) => {
  const getGoalIcon = () => {
    if (goal.isOwnGoal) {
      return <Target className="h-4 w-4 text-red-500" />; // Red icon for own goals
    }
    if (goal.type === 'assist') {
      return <Users className="h-4 w-4 text-blue-500" />;
    }
    return <Target className="h-4 w-4 text-green-500" />;
  };

  const getGoalText = () => {
    if (goal.isOwnGoal) {
      return `${goal.playerName} (OG)`;
    }
    if (goal.type === 'assist') {
      return `${goal.playerName} (Assist)`;
    }
    return goal.playerName;
  };

  const getGoalSubtext = () => {
    if (goal.isOwnGoal) {
      return 'Own Goal';
    }
    if (goal.assistPlayerName) {
      return `Assist: ${goal.assistPlayerName}`;
    }
    return '';
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      {getGoalIcon()}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`font-medium ${goal.isOwnGoal ? 'text-red-700 dark:text-red-400' : ''}`}>
            {getGoalText()}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatTime(goal.time)}
          </span>
        </div>
        {getGoalSubtext() && (
          <div className="text-sm text-muted-foreground mt-1">
            {getGoalSubtext()}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {goal.team}
        </div>
      </div>
    </div>
  );
};

export default GoalDisplay;
