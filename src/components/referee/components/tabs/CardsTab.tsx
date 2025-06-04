
import CardManagementDropdown from "../../CardManagementDropdown";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface CardsTabProps {
  allPlayers: ComponentPlayer[];
  cards: any[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onTeamSelect: (value: string) => void;
  onCardTypeChange: (value: 'yellow' | 'red') => void;
  onAddCard: () => void;
  formatTime: (seconds: number) => string;
}

const CardsTab = ({
  allPlayers,
  cards,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  matchTime,
  onPlayerSelect,
  onTeamSelect,
  onCardTypeChange,
  onAddCard,
  formatTime
}: CardsTabProps) => {
  return (
    <CardManagementDropdown
      selectedFixtureData={null}
      allPlayers={allPlayers}
      selectedPlayer={selectedPlayer}
      selectedTeam={selectedTeam}
      selectedCardType={selectedCardType}
      cards={cards}
      onPlayerSelect={onPlayerSelect}
      onTeamChange={onTeamSelect}
      onCardTypeChange={onCardTypeChange}
      onAddCard={onAddCard}
      formatTime={formatTime}
    />
  );
};

export default CardsTab;
