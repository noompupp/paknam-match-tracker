
import { ComponentPlayer } from "../hooks/useRefereeState";

interface RefereeMatchHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  resetTimer: () => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
}

export const useRefereeMatchHandlers = ({
  selectedFixtureData,
  matchTime,
  resetTimer,
  assignGoal
}: RefereeMatchHandlersProps) => {
  // Create simplified handlers for the tabs
  const handleResetMatch = () => {
    resetTimer();
    // Add any other reset logic here
  };

  const handleSaveMatch = () => {
    // Add save match logic here
    console.log('Saving match...');
  };

  const handleAssignGoal = (player: ComponentPlayer) => {
    if (!selectedFixtureData) return;
    
    const homeTeam = { 
      id: String(selectedFixtureData.home_team_id || ''), 
      name: selectedFixtureData.home_team?.name || '' 
    };
    const awayTeam = { 
      id: String(selectedFixtureData.away_team_id || ''), 
      name: selectedFixtureData.away_team?.name || '' 
    };
    
    assignGoal(player, matchTime, selectedFixtureData.id, homeTeam, awayTeam);
  };

  // Fixed function signatures to make the second parameter optional
  const handleAddGoal = (team: 'home' | 'away', additionalParam?: any) => {
    // Add goal logic here
    console.log('Adding goal for team:', team);
  };

  const handleRemoveGoal = (team: 'home' | 'away', additionalParam?: any) => {
    // Remove goal logic here
    console.log('Removing goal for team:', team);
  };

  const handleAddCard = (playerName: string, team: string, cardType: 'yellow' | 'red', time: number) => {
    // Add card logic here
    console.log('Adding card:', { playerName, team, cardType, time });
  };

  const handleAddPlayer = (player: ComponentPlayer) => {
    // Add player logic will be passed from parent
    console.log('Adding player:', player);
  };

  const handleRemovePlayer = (playerId: number) => {
    // Remove player logic will be passed from parent
    console.log('Removing player:', playerId);
  };

  const handleTogglePlayerTime = (playerId: number) => {
    // Toggle player time logic will be passed from parent
    console.log('Toggling player time:', playerId);
  };

  const handleExportSummary = () => {
    // Add export summary logic here
    console.log('Exporting summary...');
  };

  return {
    handleResetMatch,
    handleSaveMatch,
    handleAssignGoal,
    handleAddGoal,
    handleRemoveGoal,
    handleAddCard,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    handleExportSummary
  };
};
