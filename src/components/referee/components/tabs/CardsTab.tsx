
import CardManagement from "../../CardManagement";

interface CardsTabProps {
  selectedFixtureData: any;
  playerName: string;
  selectedTeam: string;
  cards: any[];
  onPlayerNameChange: (value: string) => void;
  onTeamChange: (value: string) => void;
  onAddCard: (type: 'yellow' | 'red') => void;
  formatTime: (seconds: number) => string;
}

const CardsTab = ({
  selectedFixtureData,
  playerName,
  selectedTeam,
  cards,
  onPlayerNameChange,
  onTeamChange,
  onAddCard,
  formatTime
}: CardsTabProps) => {
  return (
    <CardManagement
      selectedFixtureData={selectedFixtureData}
      playerName={playerName}
      selectedTeam={selectedTeam}
      cards={cards}
      onPlayerNameChange={onPlayerNameChange}
      onTeamChange={onTeamChange}
      onAddCard={onAddCard}
      formatTime={formatTime}
    />
  );
};

export default CardsTab;
