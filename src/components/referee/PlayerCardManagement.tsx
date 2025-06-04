
import { useToast } from "@/hooks/use-toast";
import { useCreateCard } from "@/hooks/useCards";
import { resolveTeamIdForMatchEvent } from "@/utils/teamIdMapping";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface PlayerCardManagementProps {
  allPlayers: ProcessedPlayer[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  matchTime: number;
  selectedFixtureData: any;
  setSelectedPlayer: (value: string) => void;
  addCard: (player: string, team: string, type: string, time: number) => void;
  addEvent: (type: string, description: string, time: number) => void;
  checkForSecondYellow: (playerName: string) => boolean;
  formatTime: (seconds: number) => string;
}

export const usePlayerCardManagement = ({
  allPlayers,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  matchTime,
  selectedFixtureData,
  setSelectedPlayer,
  addCard,
  addEvent,
  checkForSecondYellow,
  formatTime
}: PlayerCardManagementProps) => {
  const { toast } = useToast();
  const createCard = useCreateCard();

  // Filter players for cards based on selected team
  const playersForCards = allPlayers.filter(player => {
    if (!selectedTeam) return false;
    return player.team === selectedTeam;
  });

  const handleAddCard = async () => {
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

    if (!selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected. Please select a match first.",
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

    try {
      console.log('🟨 PlayerCardManagement: Adding card to database and local state:', {
        player: player.name,
        team: selectedTeam,
        type: selectedCardType,
        time: matchTime,
        fixture: selectedFixtureData.id
      });

      // Prepare team data for proper ID resolution
      const homeTeam = {
        id: selectedFixtureData.home_team_id,
        name: selectedFixtureData.home_team?.name,
        __id__: selectedFixtureData.home_team_id // Ensure we have the text ID
      };
      
      const awayTeam = {
        id: selectedFixtureData.away_team_id,
        name: selectedFixtureData.away_team?.name,
        __id__: selectedFixtureData.away_team_id // Ensure we have the text ID
      };

      // Resolve the text team ID for the database
      const teamId = resolveTeamIdForMatchEvent(selectedTeam, homeTeam, awayTeam);

      // Save to database first - convert string teamId to number for database
      await createCard.mutateAsync({
        fixture_id: selectedFixtureData.id,
        player_id: player.id,
        player_name: player.name,
        team_id: parseInt(teamId) || 0, // Convert string to number for database
        card_type: selectedCardType,
        event_time: matchTime,
        description: `${selectedCardType} card for ${player.name} (${selectedTeam})`
      });

      // Add to local state
      addCard(player.name, selectedTeam, selectedCardType, matchTime);
      addEvent('card', `${selectedCardType} card for ${player.name} (${selectedTeam})`, matchTime);
      
      // Reset selections
      setSelectedPlayer("");
      
      toast({
        title: "Card Added",
        description: `${selectedCardType} card given to ${player.name} at ${formatTime(matchTime)} and saved to database.`,
      });

      console.log('✅ PlayerCardManagement: Card successfully added to database and local state');

    } catch (error) {
      console.error('❌ PlayerCardManagement: Error adding card:', error);
      
      let errorMessage = 'Failed to add card';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to Add Card",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    playersForCards,
    handleAddCard
  };
};
