
import React, { useState } from "react";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import EnhancedScoreTabContainer from "./components/EnhancedScoreTabContainer";
import ScoreTabWizard from "./components/ScoreTabWizard";
import UnifiedMatchTimer from "../UnifiedMatchTimer";

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
  homeScore: number;
  awayScore: number;
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
  homeScore,
  awayScore
}: ScoreTabProps) => {
  const [showWizard, setShowWizard] = useState(false);

  // Calculate current phase for 7-a-side timer
  const HALF_DURATION = 25 * 60; // 25 minutes in seconds
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
      {/* Unified Match Timer - appears at top of all tabs */}
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

      {/* Enhanced Score Tab Content */}
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
