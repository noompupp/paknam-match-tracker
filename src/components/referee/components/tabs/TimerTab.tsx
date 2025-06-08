
import MatchTimer from "../../MatchTimer";

interface TimerTabProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetMatch: () => void;
}

const TimerTab = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  isRunning,
  formatTime,
  onToggleTimer
}: TimerTabProps) => {
  return (
    <MatchTimer
      selectedFixtureData={selectedFixtureData}
      homeScore={homeScore}
      awayScore={awayScore}
      matchTime={matchTime}
      isRunning={isRunning}
      formatTime={formatTime}
      onToggleTimer={onToggleTimer}
    />
  );
};

export default TimerTab;
