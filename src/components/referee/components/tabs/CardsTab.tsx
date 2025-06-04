
import CardManagementDropdown from "../../CardManagementDropdown";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface CardsTabProps {
  selectedFixtureData: any;
  allPlayers: ComponentPlayer[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  cards: any[];
  onPlayerSelect: (playerId: string) => void;
  onTeamChange: (team: string) => void;
  onCardTypeChange: (cardType: 'yellow' | 'red') => void;
  onAddCard: () => void;
  formatTime: (seconds: number) => string;
}

const CardsTab = ({
  selectedFixtureData,
  allPlayers,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  cards,
  onPlayerSelect,
  onTeamChange,
  onCardTypeChange,
  onAddCard,
  formatTime
}: CardsTabProps) => {
  return (
    <CardManagementDropdown
      selectedFixtureData={selectedFixtureData}
      allPlayers={allPlayers}
      selectedPlayer={selectedPlayer}
      selectedTeam={selectedTeam}
      selectedCardType={selectedCardType}
      cards={cards}
      onPlayerSelect={onPlayerSelect}
      onTeamChange={onTeamChange}
      onCardTypeChange={onCardTypeChange}
      onAddCard={onAddCard}
      formatTime={formatTime}
    />
  );
};

export default CardsTab;
