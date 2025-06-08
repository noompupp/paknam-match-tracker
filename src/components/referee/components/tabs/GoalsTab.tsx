
import GoalAssignment from "../../GoalAssignment";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface GoalsTabProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  goals: any[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onGoalTeamChange: (value: string) => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
}

const GoalsTab = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  goals,
  selectedPlayer,
  selectedGoalType,
  selectedGoalTeam,
  matchTime,
  onPlayerSelect,
  onGoalTypeChange,
  onGoalTeamChange,
  onAssignGoal,
  formatTime,
  homeScore,
  awayScore,
  selectedFixtureData
}: GoalsTabProps) => {
  const handleAssignGoal = () => {
    if (!selectedPlayer || !selectedGoalTeam) return;
    
    // Get filtered players based on selected team
    const getFilteredPlayers = () => {
      if (selectedGoalTeam === 'home' && homeTeamPlayers) {
        return homeTeamPlayers;
      } else if (selectedGoalTeam === 'away' && awayTeamPlayers) {
        return awayTeamPlayers;
      }
      return [];
    };
    
    const filteredPlayers = getFilteredPlayers();
    const player = filteredPlayers.find(p => p.id.toString() === selectedPlayer);
    
    if (!player) {
      console.warn('Player not found in filtered list:', selectedPlayer);
      return;
    }
    
    onAssignGoal(player);
  };

  return (
    <GoalAssignment
      allPlayers={allPlayers}
      homeTeamPlayers={homeTeamPlayers}
      awayTeamPlayers={awayTeamPlayers}
      goals={goals}
      selectedPlayer={selectedPlayer}
      selectedGoalType={selectedGoalType}
      selectedGoalTeam={selectedGoalTeam}
      matchTime={matchTime}
      onPlayerSelect={onPlayerSelect}
      onGoalTypeChange={onGoalTypeChange}
      onGoalTeamChange={onGoalTeamChange}
      onAssignGoal={handleAssignGoal}
      formatTime={formatTime}
      homeScore={homeScore}
      awayScore={awayScore}
      selectedFixtureData={selectedFixtureData}
    />
  );
};

export default GoalsTab;
