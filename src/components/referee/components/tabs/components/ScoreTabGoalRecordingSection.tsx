
import React from "react";
import SimplifiedGoalRecording from "./SimplifiedGoalRecording";

interface Props {
  homeTeamName: string;
  awayTeamName: string;
  onRecordGoal: () => void;
  isDisabled: boolean;
}

const ScoreTabGoalRecordingSection = ({
  homeTeamName,
  awayTeamName,
  onRecordGoal,
  isDisabled,
}: Props) => (
  <SimplifiedGoalRecording
    homeTeamName={homeTeamName}
    awayTeamName={awayTeamName}
    onRecordGoal={onRecordGoal}
    isDisabled={isDisabled}
  />
);

export default ScoreTabGoalRecordingSection;
