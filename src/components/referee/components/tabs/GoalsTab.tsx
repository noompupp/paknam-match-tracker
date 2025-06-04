
import GoalAssignment from "../../GoalAssignment";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface GoalsTabProps {
  allPlayers: ComponentPlayer[];
  goals: any[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
}

const GoalsTab = ({
  allPlayers,
  goals,
  selectedPlayer,
  selectedGoalType,
  matchTime,
  onPlayerSelect,
  onGoalTypeChange,
  onAssignGoal,
  formatTime,
  homeScore,
  awayScore,
  selectedFixtureData
}: GoalsTabProps) => {
  const handleAssignGoal = () => {
    if (!selectedPlayer) return;
    
    const player = allPlayers.find(p => p.id.toString() === selectedPlayer);
    if (!player) return;
    
    onAssignGoal(player);
  };

  return (
    <GoalAssignment
      allPlayers={allPlayers}
      goals={goals}
      selectedPlayer={selectedPlayer}
      selectedGoalType={selectedGoalType}
      matchTime={matchTime}
      onPlayerSelect={onPlayerSelect}
      onGoalTypeChange={onGoalTypeChange}
      onAssignGoal={handleAssignGoal}
      formatTime={formatTime}
      homeScore={homeScore}
      awayScore={awayScore}
      selectedFixtureData={selectedFixtureData}
    />
  );
};

export default GoalsTab;
