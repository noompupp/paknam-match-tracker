import React, { useState } from "react";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import EnhancedScoreTabContainer from "./components/EnhancedScoreTabContainer";
import ScoreTabWizard from "./components/ScoreTabWizard";
import UnifiedMatchTimer from "../UnifiedMatchTimer";
import { useMatchStore } from "@/stores/useMatchStore";

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
  forceRefresh,
}: ScoreTabProps) => {
  const [showWizard, setShowWizard] = useState(false);

  // Use store for scores
  const { homeScore, awayScore } = useMatchStore();

  // HALF_DURATION and phase logic unchanged
  const HALF_DURATION = 25 * 60;
  const currentPhase = matchTime <= HALF_DURATION ? 'first' :
    matchTime <= HALF_DURATION * 2 ? 'second' : 'overtime';

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
    <div className="space-y-6">
      {/* Unified Match Timer */}
      <UnifiedMatchTimer
        selectedFixtureData={selectedFixtureData}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        isRunning={isRunning}
        formatTime={formatTime}
        onToggleTimer={onToggleTimer}
        onResetMatch={onResetMatch}
        phase={currentPhase}
      />

      {/* Score Tab Content */}
      <EnhancedScoreTabContainer
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
    </div>
  );
};

export default ScoreTab;
