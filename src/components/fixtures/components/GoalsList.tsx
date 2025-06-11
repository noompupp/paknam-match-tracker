
import GoalDisplay from "./GoalDisplay";

interface GoalsListProps {
  goals: any[];
  teamType: 'home' | 'away';
  teamColor: string;
}

const GoalsList = ({ goals, teamType, teamColor }: GoalsListProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {goals.length > 0 ? (
        goals.map((goal, index) => (
          <GoalDisplay
            key={goal.id || `${teamType}-goal-${index}`}
            goal={goal}
            formatTime={formatTime}
            teamColor={teamColor}
          />
        ))
      ) : (
        <div className="text-sm text-muted-foreground italic text-center py-4">
          No goals scored
        </div>
      )}
    </div>
  );
};

export default GoalsList;
