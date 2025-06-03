
import { useToast } from "@/hooks/use-toast";

// Define consistent Player interface for this component
interface ComponentPlayer {
  id: number;
  name: string;
  team: string;
  number?: string;
  position?: string;
}

// Player interface for player tracking (needs number as number)
interface PlayerTrackingPlayer {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
}

interface PlayerManagementProps {
  members: any[];
  selectedFixtureData: any;
  allPlayers: ComponentPlayer[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  selectedTimePlayer: string;
  cards: any[];
  goals: any[];
  matchTime: number;
  setSelectedGoalPlayer: (player: string) => void;
  setSelectedGoalType: (type: 'goal' | 'assist') => void;
  setSelectedPlayer: (player: string) => void;
  setSelectedTeam: (team: string) => void;
  setSelectedCardType: (type: 'yellow' | 'red') => void;
  setSelectedTimePlayer: (player: string) => void;
  assignGoal: (player: any, time: number) => any;
  addCard: (player: any, team: string, time: number, type: 'yellow' | 'red') => any;
  addPlayer: (player: any, time: number) => any;
  removePlayer: (playerId: number) => any;
  togglePlayerTime: (playerId: number, time: number) => any;
  addEvent: (type: string, description: string, time: number) => void;
  checkForSecondYellow: (playerName: string, teamName: string) => boolean;
  formatTime: (seconds: number) => string;
}

export const usePlayerManagement = ({
  members,
  selectedFixtureData,
  allPlayers,
  selectedGoalPlayer,
  selectedGoalType,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  selectedTimePlayer,
  cards,
  goals,
  matchTime,
  setSelectedGoalPlayer,
  setSelectedGoalType,
  setSelectedPlayer,
  setSelectedTeam,
  setSelectedCardType,
  setSelectedTimePlayer,
  assignGoal,
  addCard,
  addPlayer,
  removePlayer,
  togglePlayerTime,
  addEvent,
  checkForSecondYellow,
  formatTime
}: PlayerManagementProps) => {
  const { toast } = useToast();

  // Create Player objects for card management that match the expected interface
  const playersForCards = members?.filter(member => 
    selectedFixtureData && (
      member.team_id === selectedFixtureData.home_team_id || 
      member.team_id === selectedFixtureData.away_team_id
    )
  ).map(member => ({
    id: member.id,
    name: member.name,
    team: member.team?.name || '',
    number: typeof member.number === 'number' ? member.number : parseInt(String(member.number || '0')),
    position: member.position
  })) || [];

  // Create PlayerTrackingPlayer objects for player tracking (requires number as number)
  const playersForTracking: PlayerTrackingPlayer[] = members?.filter(member => 
    selectedFixtureData && (
      member.team_id === selectedFixtureData.home_team_id || 
      member.team_id === selectedFixtureData.away_team_id
    )
  ).map(member => ({
    id: member.id,
    name: member.name,
    team: member.team?.name || '',
    number: typeof member.number === 'number' ? member.number : parseInt(String(member.number || '0')), // Properly handle type conversion
    position: member.position || 'Player'
  })) || [];

  const handleAssignGoal = () => {
    if (!selectedGoalPlayer) return;

    const player = allPlayers.find(p => p.id === parseInt(selectedGoalPlayer));
    if (!player) return;

    const goal = assignGoal(player, matchTime);
    if (goal) {
      addEvent(selectedGoalType, `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} by ${player.name} (${player.team})`, matchTime);
      
      toast({
        title: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
        description: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} at ${formatTime(matchTime)}.`,
      });
    }
  };

  const handleAddCard = () => {
    if (!selectedPlayer || !selectedFixtureData) return;

    const player = playersForCards.find(p => p.id.toString() === selectedPlayer);
    if (!player) return;

    const teamName = selectedTeam === 'home' 
      ? selectedFixtureData.home_team?.name || 'Home'
      : selectedFixtureData.away_team?.name || 'Away';

    // Check for second yellow card
    const isSecondYellow = selectedCardType === 'yellow' && checkForSecondYellow(player.name, teamName);
    
    const card = addCard(player, teamName, matchTime, selectedCardType);
    if (card) {
      addEvent(selectedCardType === 'yellow' ? 'yellow_card' : 'red_card', `${selectedCardType} card for ${player.name} (${teamName})`, matchTime);
      
      let toastTitle = `${selectedCardType === 'yellow' ? 'Yellow' : 'Red'} Card Issued!`;
      let toastDescription = `${selectedCardType === 'yellow' ? 'Yellow' : 'Red'} card issued to ${player.name} at ${formatTime(matchTime)}.`;
      
      if (isSecondYellow) {
        toastTitle = "Second Yellow Card!";
        toastDescription += " Player should receive an automatic red card.";
        toast({
          title: "Warning",
          description: `${player.name} now has 2 yellow cards and should be sent off.`,
          variant: "destructive"
        });
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
      });
    }
  };

  const handleAddPlayer = () => {
    if (!selectedTimePlayer) return;

    const player = playersForTracking.find(p => p.id === parseInt(selectedTimePlayer));
    if (player) {
      const playerTime = addPlayer(player, matchTime);
      if (playerTime) {
        addEvent('player_on', `${player.name} entered the field`, matchTime);
      }
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    const player = removePlayer(playerId);
    if (player) {
      addEvent('player_removed', `${player.name} removed from tracking`, matchTime);
    }
  };

  const handleTogglePlayerTime = (playerId: number) => {
    const player = togglePlayerTime(playerId, matchTime);
    if (player) {
      addEvent(
        player.isPlaying ? 'player_on' : 'player_off',
        `${player.name} ${player.isPlaying ? 'entered' : 'left'} the field`,
        matchTime
      );
    }
  };

  return {
    playersForCards,
    playersForTracking,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime
  };
};
