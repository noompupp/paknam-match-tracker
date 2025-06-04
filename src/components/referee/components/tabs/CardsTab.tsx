
import CardManagementDropdown from "../../CardManagementDropdown";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

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
  onTeamSelect: (value: string) => void;
  onCardTypeChange: (value: 'yellow' | 'red') => void;
  onAddCard: (playerName: string, team: string, cardType: 'yellow' | 'red', time: number) => void;
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
  onTeamSelect,
  onCardTypeChange,
  onAddCard,
  formatTime
}: CardsTabProps) => {
  const handleAddCard = () => {
    if (!selectedPlayer || !selectedTeam) return;
    
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
    
    if (!player) return;
    
    onAddCard(player.name, selectedTeam, selectedCardType, matchTime);
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
      onTeamChange={onTeamSelect}
      onCardTypeChange={onCardTypeChange}
      onAddCard={handleAddCard}
      formatTime={formatTime}
    />
  );
};

export default CardsTab;
