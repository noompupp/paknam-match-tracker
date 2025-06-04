
import CardManagementDropdown from "../../CardManagementDropdown";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface CardsTabProps {
  allPlayers: ProcessedPlayer[];
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
    
    const player = allPlayers.find(p => p.id.toString() === selectedPlayer);
    if (!player) return;
    
    onAddCard(player.name, selectedTeam, selectedCardType, matchTime);
  };

  return (
    <CardManagementDropdown
      selectedFixtureData={selectedFixtureData}
      allPlayers={allPlayers}
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
