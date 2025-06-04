
import { usePlayerManagement } from "@/hooks/usePlayerManagement";

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
  return usePlayerManagement(props);
};
