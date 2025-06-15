import React from "react";
import MatchControlsSection from "./MatchControlsSection";

interface Props {
  isRunning: boolean;
  onToggleTimer: () => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
  onFinishMatch?: () => void; // <--- ADD
  isSaving?: boolean;
}

const ScoreTabMatchControlsSection = ({
  isRunning,
  onToggleTimer,
  onSaveMatch,
  onResetMatch,
  onFinishMatch, // <--- pass
  isSaving
}: Props) => (
  <MatchControlsSection
    isRunning={isRunning}
    onToggleTimer={onToggleTimer}
    onSaveMatch={onSaveMatch}
    onResetMatch={onResetMatch}
    onFinishMatch={onFinishMatch} // <--- pass
    isSaving={isSaving}
  />
);

export default ScoreTabMatchControlsSection;
