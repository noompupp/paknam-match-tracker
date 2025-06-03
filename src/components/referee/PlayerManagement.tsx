
import { useToast } from "@/hooks/use-toast";
import { getNumericTeamId } from "@/utils/teamIdMapping";

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
  assignGoal: (player: any, matchTime: number) => any;
  addCard: (player: string, team: string, type: string, time: number) => void;
  addPlayer: (player: any) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
  addEvent: (type: string, description: string, time: number) => void;
  checkForSecondYellow: (playerName: string) => boolean;
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

  // Filter players for cards based on selected team
  const playersForCards = allPlayers.filter(player => {
    if (!selectedTeam) return false;
    return player.team === selectedTeam;
  });

  // All players available for time tracking
  const playersForTracking = allPlayers;

  const handleAssignGoal = async () => {
    if (!selectedGoalPlayer) {
      toast({
        title: "Error",
        description: "Please select a player first.",
        variant: "destructive",
      });
      return;
    }

    const player = allPlayers.find(p => p.id.toString() === selectedGoalPlayer);
    if (!player) {
      toast({
        title: "Error",
        description: "Selected player not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('⚽ PlayerManagement: Assigning goal/assist:', {
        player: player.name,
        team: player.team,
        type: selectedGoalType,
        time: matchTime
      });

      // Get the numeric team ID for the player's team
      let teamId: number;
      if (selectedFixtureData?.home_team?.name === player.team) {
        teamId = selectedFixtureData.home_team_id;
      } else if (selectedFixtureData?.away_team?.name === player.team) {
        teamId = selectedFixtureData.away_team_id;
      } else {
        throw new Error(`Cannot find team ID for player's team: ${player.team}`);
      }

      // Use the assignGoal function which should call goalAssignmentService
      const goalData = assignGoal(player, matchTime);
      
      if (goalData) {
        // Add event to local events
        addEvent(
          selectedGoalType,
          `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} (${player.team})`,
          matchTime
        );

        toast({
          title: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
          description: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} at ${formatTime(matchTime)}`,
        });

        console.log('✅ PlayerManagement: Goal/assist assigned successfully');
      }
    } catch (error) {
      console.error('❌ PlayerManagement: Error assigning goal/assist:', error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to assign goal/assist",
        variant: "destructive",
      });
    }
  };

  const handleAddCard = () => {
    if (!selectedPlayer || !selectedTeam) {
      toast({
        title: "Error",
        description: "Please select both a player and team.",
        variant: "destructive",
      });
      return;
    }

    const player = playersForCards.find(p => p.id.toString() === selectedPlayer);
    if (!player) {
      toast({
        title: "Error",
        description: "Selected player not found in the selected team.",
        variant: "destructive",
      });
      return;
    }

    // Check for second yellow card
    if (selectedCardType === 'yellow' && checkForSecondYellow(player.name)) {
      toast({
        title: "Warning",
        description: `${player.name} already has a yellow card. This will result in a red card.`,
      });
    }

    addCard(player.name, selectedTeam, selectedCardType, matchTime);
    addEvent('card', `${selectedCardType} card for ${player.name} (${selectedTeam})`, matchTime);
    
    // Reset selections
    setSelectedPlayer("");
    
    toast({
      title: "Card Added",
      description: `${selectedCardType} card given to ${player.name} at ${formatTime(matchTime)}`,
    });
  };

  const handleAddPlayer = () => {
    if (!selectedTimePlayer) {
      toast({
        title: "Error",
        description: "Please select a player to track.",
        variant: "destructive",
      });
      return;
    }

    const player = playersForTracking.find(p => p.id.toString() === selectedTimePlayer);
    if (!player) {
      toast({
        title: "Error",
        description: "Selected player not found.",
        variant: "destructive",
      });
      return;
    }

    addPlayer(player);
    addEvent('player_added', `Started tracking time for ${player.name} (${player.team})`, matchTime);
    setSelectedTimePlayer("");
    
    toast({
      title: "Player Added",
      description: `Now tracking playing time for ${player.name}`,
    });
  };

  const handleRemovePlayer = (playerId: number) => {
    const player = playersForTracking.find(p => p.id === playerId);
    if (player) {
      removePlayer(playerId);
      addEvent('player_removed', `Stopped tracking time for ${player.name}`, matchTime);
      
      toast({
        title: "Player Removed",
        description: `Stopped tracking ${player.name}`,
      });
    }
  };

  const handleTogglePlayerTime = (playerId: number) => {
    const player = playersForTracking.find(p => p.id === playerId);
    if (player) {
      togglePlayerTime(playerId);
      // The addEvent will be handled by the toggle function itself
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
