
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
  onTeamChange: (value: string) => void;
  onCardTypeChange: (value: 'yellow' | 'red') => void;
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
    
    console.log('Adding card:', { player: player.name, team: selectedTeam, cardType: selectedCardType, time: matchTime });
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
