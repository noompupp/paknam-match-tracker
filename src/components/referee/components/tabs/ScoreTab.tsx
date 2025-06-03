
import ScoreManagement from "../../ScoreManagement";

interface ScoreTabProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  isRunning: boolean;
  onAddGoal: (team: 'home' | 'away') => void;
  onRemoveGoal: (team: 'home' | 'away') => void;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
}

const ScoreTab = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  isRunning,
  onAddGoal,
  onRemoveGoal,
  onToggleTimer,
  onResetMatch,
  onSaveMatch
}: ScoreTabProps) => {
  return (
    <ScoreManagement
      selectedFixtureData={selectedFixtureData}
      homeScore={homeScore}
      awayScore={awayScore}
      isRunning={isRunning}
      isPending={false}
      onAddGoal={onAddGoal}
      onRemoveGoal={onRemoveGoal}
      onToggleTimer={onToggleTimer}
      onResetMatch={onResetMatch}
      onSaveMatch={onSaveMatch}
    />
  );
};

export default ScoreTab;
