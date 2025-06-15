
import React from "react";
import MatchControlsSection from "./MatchControlsSection";

interface Props {
  isRunning: boolean;
  onToggleTimer: () => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
  onFinishMatch?: () => void;
  isSaving?: boolean;
}

const ScoreTabMatchControlsSection = ({
  isRunning,
  onToggleTimer,
  onSaveMatch,
  onResetMatch,
  onFinishMatch,
  isSaving
}: Props) => (
  <MatchControlsSection
    isRunning={isRunning}
    onToggleTimer={onToggleTimer}
    onSaveMatch={onSaveMatch}
    onResetMatch={onResetMatch}
    onFinishMatch={onFinishMatch}
    isSaving={isSaving}
  />
);

export default ScoreTabMatchControlsSection;
