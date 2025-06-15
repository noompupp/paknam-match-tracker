
import React from "react";
import MatchControlsSection from "./MatchControlsSection";

interface Props {
  isRunning: boolean;
  onToggleTimer: () => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
}

const ScoreTabMatchControlsSection = ({
  isRunning,
  onToggleTimer,
  onSaveMatch,
  onResetMatch,
}: Props) => (
  <MatchControlsSection
    isRunning={isRunning}
    onToggleTimer={onToggleTimer}
    onSaveMatch={onSaveMatch}
    onResetMatch={onResetMatch}
  />
);

export default ScoreTabMatchControlsSection;
