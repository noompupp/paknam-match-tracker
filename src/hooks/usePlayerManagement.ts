import { usePlayerGoalAssignment } from "@/components/referee/PlayerGoalAssignment";
import { usePlayerCardManagement } from "@/components/referee/PlayerCardManagement";
import { usePlayerTimeManagement } from "@/components/referee/PlayerTimeManagement";

interface Player {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
}

interface PlayerManagementProps {
  members: any[];
  selectedFixtureData: any;
  allPlayers: Player[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  selectedTimePlayer: string;
  cards: any[];
  goals: any[];
  matchTime: number;
  setSelectedGoalPlayer: (value: string) => void;
  setSelectedGoalType: (value: 'goal' | 'assist') => void;
  setSelectedPlayer: (value: string) => void;
  setSelectedTeam: (value: string) => void;
  setSelectedCardType: (value: 'yellow' | 'red') => void;
  setSelectedTimePlayer: (value: string) => void;
  assignGoal: (player: any, matchTime: number, fixtureId: number, homeTeam: { id: number; name: string }, awayTeam: { id: number; name: string }) => any;
  addCard: (player: string, team: string, type: string, time: number) => void;
  addPlayer: (player: any) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
  addEvent: (type: string, description: string, time: number) => void;
  checkForSecondYellow: (playerName: string) => boolean;
  formatTime: (seconds: number) => string;
}

export const usePlayerManagement = (props: PlayerManagementProps) => {
  const goalAssignment = usePlayerGoalAssignment({
    allPlayers: props.allPlayers,
    selectedFixtureData: props.selectedFixtureData,
    selectedGoalPlayer: props.selectedGoalPlayer,
    selectedGoalType: props.selectedGoalType,
    matchTime: props.matchTime,
    assignGoal: props.assignGoal,
    addEvent: props.addEvent,
    formatTime: props.formatTime
  });

  const cardManagement = usePlayerCardManagement({
    allPlayers: props.allPlayers,
    selectedPlayer: props.selectedPlayer,
    selectedTeam: props.selectedTeam,
    selectedCardType: props.selectedCardType,
    matchTime: props.matchTime,
    selectedFixtureData: props.selectedFixtureData,
    setSelectedPlayer: props.setSelectedPlayer,
    addCard: props.addCard,
    addEvent: props.addEvent,
    checkForSecondYellow: props.checkForSecondYellow,
    formatTime: props.formatTime
  });

  const timeManagement = usePlayerTimeManagement({
    allPlayers: props.allPlayers,
    selectedTimePlayer: props.selectedTimePlayer,
    matchTime: props.matchTime,
    setSelectedTimePlayer: props.setSelectedTimePlayer,
    addPlayer: props.addPlayer,
    removePlayer: props.removePlayer,
    togglePlayerTime: props.togglePlayerTime,
    addEvent: props.addEvent
  });

  return {
    // Goal assignment
    handleAssignGoal: goalAssignment.handleAssignGoal,
    
    // Card management
    playersForCards: cardManagement.playersForCards,
    handleAddCard: cardManagement.handleAddCard,
    
    // Time management
    playersForTracking: timeManagement.playersForTracking,
    handleAddPlayer: timeManagement.handleAddPlayer,
    handleRemovePlayer: timeManagement.handleRemovePlayer,
    handleTogglePlayerTime: timeManagement.handleTogglePlayerTime
  };
};
