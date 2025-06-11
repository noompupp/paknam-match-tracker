
import CardManagementDropdown from "../../CardManagementDropdown";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useToast } from "@/hooks/use-toast";
import { assignCardToPlayer } from "@/services/fixtures/simplifiedCardService";
import { resolveTeamIdForMatchEvent, normalizeTeamIdForDatabase } from "@/utils/teamIdMapping";

interface CardsTabProps {
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  cards: any[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  matchTime: number;
  selectedFixtureData: any;
  onPlayerSelect: (value: string) => void;
  onTeamChange: (value: string) => void;
  onCardTypeChange: (value: 'yellow' | 'red') => void;
  onCardAdded?: (cardData: any) => void; // Add callback for local state update
  formatTime: (seconds: number) => string;
}

const CardsTab = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  cards,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  matchTime,
  selectedFixtureData,
  onPlayerSelect,
  onTeamChange,
  onCardTypeChange,
  onCardAdded,
  formatTime
}: CardsTabProps) => {
  const { toast } = useToast();

  const handleAddCard = async () => {
    if (!selectedPlayer || !selectedTeam || !selectedFixtureData) {
      toast({
        title: "Error",
        description: "Please select a player, team, and ensure a fixture is selected",
        variant: "destructive"
      });
      return;
    }
    
    // Find player in filtered arrays first, then fall back to all players
    let player: ProcessedPlayer | undefined;
    
    if (selectedTeam === 'home' && homeTeamPlayers) {
      player = homeTeamPlayers.find(p => p.id.toString() === selectedPlayer);
    } else if (selectedTeam === 'away' && awayTeamPlayers) {
      player = awayTeamPlayers.find(p => p.id.toString() === selectedPlayer);
    }
    
    // Fallback to all players if not found in filtered arrays
    if (!player) {
      player = allPlayers.find(p => p.id.toString() === selectedPlayer);
    }
    
    if (!player) {
      toast({
        title: "Error",
        description: "Player not found",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🟨🟥 CardsTab: Adding card with local state update:', {
        player: player.name,
        team: player.team,
        cardType: selectedCardType,
        time: matchTime,
        fixture: selectedFixtureData.id
      });

      // Validate team data
      if (!selectedFixtureData.home_team || !selectedFixtureData.away_team) {
        throw new Error('Missing team data in fixture');
      }

      // Use the team ID resolution utility
      const teamId = resolveTeamIdForMatchEvent(
        player.team,
        {
          id: selectedFixtureData.home_team_id || selectedFixtureData.home_team?.id?.toString(),
          name: selectedFixtureData.home_team?.name,
          __id__: selectedFixtureData.home_team?.__id__ || selectedFixtureData.home_team_id
        },
        {
          id: selectedFixtureData.away_team_id || selectedFixtureData.away_team?.id?.toString(),
          name: selectedFixtureData.away_team?.name,
          __id__: selectedFixtureData.away_team?.__id__ || selectedFixtureData.away_team_id
        }
      );

      const normalizedTeamId = normalizeTeamIdForDatabase(teamId);

      // Use the simplified card service directly
      const cardResult = await assignCardToPlayer({
        fixtureId: selectedFixtureData.id,
        playerId: player.id,
        playerName: player.name,
        teamId: normalizedTeamId,
        cardType: selectedCardType,
        eventTime: matchTime
      });

      // Create local card data for immediate UI update
      const localCardData = {
        id: Date.now(), // Temporary ID for local state
        player: player.name,
        playerId: player.id,
        team: selectedTeam,
        teamId: normalizedTeamId,
        type: selectedCardType,
        cardType: selectedCardType,
        time: matchTime,
        timestamp: new Date().toISOString(),
        synced: true // Mark as synced since we just saved to DB
      };

      // Update local state immediately
      if (onCardAdded) {
        onCardAdded(localCardData);
      }

      // Handle second yellow card scenario
      if (cardResult && cardResult.isSecondYellow) {
        // Add red card to local state as well
        const redCardData = {
          ...localCardData,
          id: Date.now() + 1,
          type: 'red' as const,
          cardType: 'red' as const
        };
        
        if (onCardAdded) {
          onCardAdded(redCardData);
        }

        toast({
          title: "Second Yellow Card",
          description: `${player.name} receives automatic red card for second yellow`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Card Issued",
          description: `${selectedCardType} card given to ${player.name} and saved to database`,
        });
      }

      // Reset selection after successful add
      onPlayerSelect('');

      console.log('✅ CardsTab: Card successfully added and local state updated');
    } catch (error) {
      console.error('❌ CardsTab: Failed to add card:', error);
      
      let errorMessage = 'Failed to add card';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Card Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <CardManagementDropdown
      selectedFixtureData={selectedFixtureData}
      allPlayers={allPlayers}
      homeTeamPlayers={homeTeamPlayers}
      awayTeamPlayers={awayTeamPlayers}
      selectedPlayer={selectedPlayer}
      selectedTeam={selectedTeam}
      selectedCardType={selectedCardType}
      cards={cards}
      onPlayerSelect={onPlayerSelect}
      onTeamChange={onTeamChange}
      onCardTypeChange={onCardTypeChange}
      onAddCard={handleAddCard}
      formatTime={formatTime}
    />
  );
};

export default CardsTab;
