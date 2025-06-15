
import React from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import ScoreTabGoalsSummarySection from "./ScoreTabGoalsSummarySection";
import ScoreTabGoalRecordingSection from "./ScoreTabGoalRecordingSection";
import ScoreTabUnsavedChangesSection from "./ScoreTabUnsavedChangesSection";
import ScoreTabMatchControlsSection from "./ScoreTabMatchControlsSection";

interface UnsavedItemsCount {
  goals: number;
  cards: number;
  playerTimes: number;
}

interface EnhancedScoreTabContainerProps {
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
  onShowWizard: () => void;
  onFinishMatch?: () => void;
}

const EnhancedScoreTabContainer = ({
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
  onShowWizard,
  onFinishMatch
}: EnhancedScoreTabContainerProps) => {
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';
  const homeTeamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id;
  const awayTeamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id;

  // Use global match store
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [unsavedItemsCount, setUnsavedItemsCount] = React.useState<UnsavedItemsCount>({ goals: 0, cards: 0, playerTimes: 0 });

  console.log('📊 EnhancedScoreTabContainer: Simplified workflow active:', { 
    homeTeamName,
    awayTeamName,
    hasUnsavedChanges,
    unsavedItemsCount
  });

  const handleRecordGoal = () => {
    console.log('🎯 EnhancedScoreTabContainer: Opening goal entry wizard');
    onShowWizard();
  };

  const handleSaveMatch = async () => {
    console.log('💾 EnhancedScoreTabContainer: Save match triggered');
    onSaveMatch();
    setHasUnsavedChanges(false);
    setUnsavedItemsCount({ goals: 0, cards: 0, playerTimes: 0 });
  };

  return (
    <div className="space-y-6">
      <ScoreTabGoalsSummarySection goals={[]} formatTime={formatTime} />
      <ScoreTabGoalRecordingSection
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onRecordGoal={handleRecordGoal}
        isDisabled={false}
      />
      <ScoreTabUnsavedChangesSection
        hasUnsavedChanges={hasUnsavedChanges}
        unsavedItemsCount={unsavedItemsCount}
        onSave={handleSaveMatch}
      />
      <ScoreTabMatchControlsSection
        isRunning={isRunning}
        onToggleTimer={onToggleTimer}
        onSaveMatch={handleSaveMatch}
        onResetMatch={onResetMatch}
        onFinishMatch={onFinishMatch}
      />
    </div>
  );
};

export default EnhancedScoreTabContainer;

