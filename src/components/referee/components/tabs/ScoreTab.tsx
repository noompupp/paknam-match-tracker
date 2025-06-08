
import React, { useState } from "react";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import ScoreTabContainer from "./components/ScoreTabContainer";
import ScoreTabWizard from "./components/ScoreTabWizard";

interface ScoreTabProps {
  selectedFixtureData: any;
  isRunning: boolean;
  matchTime: number;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
}

const ScoreTab = ({
  selectedFixtureData,
  isRunning,
  matchTime,
  homeTeamPlayers,
  awayTeamPlayers,
  formatTime,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
  onAssignGoal,
  forceRefresh
}: ScoreTabProps) => {
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => {
    console.log('🎯 ScoreTab: Goal assigned, closing wizard');
    setShowWizard(false);
  };

  if (showWizard) {
    return (
      <ScoreTabWizard
        selectedFixtureData={selectedFixtureData}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        matchTime={matchTime}
        formatTime={formatTime}
        onGoalAssigned={handleWizardGoalAssigned}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <ScoreTabContainer
      selectedFixtureData={selectedFixtureData}
      isRunning={isRunning}
      matchTime={matchTime}
      homeTeamPlayers={homeTeamPlayers}
      awayTeamPlayers={awayTeamPlayers}
      formatTime={formatTime}
      onToggleTimer={onToggleTimer}
      onResetMatch={onResetMatch}
      onSaveMatch={onSaveMatch}
      onAssignGoal={onAssignGoal}
      forceRefresh={forceRefresh}
      onShowWizard={() => setShowWizard(true)}
    />
  );
};

export default ScoreTab;
