
import TeamSelectionModal from "../../TeamSelectionModal";
import QuickGoalSelectionModal from "../../QuickGoalSelectionModal";

interface GoalsTabModalsProps {
  showTeamSelection: boolean;
  showQuickGoalSelection: boolean;
  homeTeamName: string;
  awayTeamName: string;
  goals: any[];
  formatTime: (seconds: number) => string;
  onCloseTeamSelection: () => void;
  onCloseQuickGoalSelection: () => void;
  onTeamSelected: (team: 'home' | 'away') => void;
  onQuickGoalSelected: (goal: any) => void;
}

const GoalsTabModals = ({
  showTeamSelection,
  showQuickGoalSelection,
  homeTeamName,
  awayTeamName,
  goals,
  formatTime,
  onCloseTeamSelection,
  onCloseQuickGoalSelection,
  onTeamSelected,
  onQuickGoalSelected
}: GoalsTabModalsProps) => {
  return (
    <>
      <TeamSelectionModal
        isOpen={showTeamSelection}
        onClose={onCloseTeamSelection}
        onTeamSelect={onTeamSelected}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        title="Select Team for Quick Goal"
        description="Which team scored the goal?"
      />

      <QuickGoalSelectionModal
        isOpen={showQuickGoalSelection}
        onClose={onCloseQuickGoalSelection}
        onGoalSelected={onQuickGoalSelected}
        goals={goals.filter(g => g.playerName === 'Quick Goal')}
        formatTime={formatTime}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />
    </>
  );
};

export default GoalsTabModals;
