
import GoalDisplay from "./GoalDisplay";

interface GoalsListProps {
  goals: any[];
  teamType: 'home' | 'away';
  teamColor: string;
}

const GoalsList = ({ goals, teamType, teamColor }: GoalsListProps) => {
  return (
    <div className="space-y-4">
      {goals.length > 0 ? (
        goals.map((goal, index) => (
          <GoalDisplay
            key={goal.id || `${teamType}-goal-${index}`}
            goal={goal}
            index={index}
            teamType={teamType}
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
