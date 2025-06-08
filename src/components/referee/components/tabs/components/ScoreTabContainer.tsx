
import { useState } from "react";
import GoalEntryWizard from "../../GoalEntryWizard";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import LiveScoreHeader from "./LiveScoreHeader";
import QuickGoalSection from "./QuickGoalSection";
import GoalsSummary from "./GoalsSummary";
import MatchControlsSection from "./MatchControlsSection";
import { useQuickGoalHandler } from "./QuickGoalHandler";
import { useDetailedGoalHandler } from "./DetailedGoalHandler";

interface ScoreTabContainerProps {
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
  isRunning: boolean;
  goals: any[];
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

const ScoreTabContainer = ({
  homeScore,
  awayScore,
  selectedFixtureData,
  isRunning,
  goals,
  matchTime,
  homeTeamPlayers,
  awayTeamPlayers,
  formatTime,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
  onAssignGoal,
  forceRefresh
}: ScoreTabContainerProps) => {
  const [showDetailedEntry, setShowDetailedEntry] = useState(false);
  const [quickGoalTeam, setQuickGoalTeam] = useState<'home' | 'away' | null>(null);

  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  // Quick goal handling
  const { isProcessingQuickGoal, handleQuickGoal } = useQuickGoalHandler({
    selectedFixtureData,
    matchTime,
    formatTime,
    forceRefresh,
    onSaveMatch
  });

  // Detailed goal handling
  const { handleWizardGoalAssigned } = useDetailedGoalHandler({
    onAssignGoal,
    forceRefresh
  });

  const handleDetailedGoalEntry = (team: 'home' | 'away') => {
    setQuickGoalTeam(team);
    setShowDetailedEntry(true);
  };

  const handleWizardGoalComplete = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
  }) => {
    handleWizardGoalAssigned(goalData);
    setShowDetailedEntry(false);
    setQuickGoalTeam(null);
  };

  // Get unassigned goals for the indicator
  const unassignedGoals = goals.filter(goal => 
    goal.playerName === 'Quick Goal' || goal.playerName === 'Unknown Player'
  );

  if (showDetailedEntry) {
    return (
      <div className="space-y-6">
        <GoalEntryWizard
          selectedFixtureData={selectedFixtureData}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          matchTime={matchTime}
          formatTime={formatTime}
          onGoalAssigned={handleWizardGoalComplete}
          onCancel={() => {
            setShowDetailedEntry(false);
            setQuickGoalTeam(null);
          }}
          initialTeam={quickGoalTeam || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LiveScoreHeader
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        isRunning={isRunning}
        formatTime={formatTime}
      />

      <QuickGoalSection
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        unassignedGoalsCount={unassignedGoals.length}
        isProcessingQuickGoal={isProcessingQuickGoal}
        onQuickGoal={handleQuickGoal}
        onDetailedGoalEntry={handleDetailedGoalEntry}
        onOpenDetailedEntry={() => setShowDetailedEntry(true)}
      />

      <GoalsSummary goals={goals} formatTime={formatTime} />

      <MatchControlsSection
        isRunning={isRunning}
        onToggleTimer={onToggleTimer}
        onSaveMatch={onSaveMatch}
        onResetMatch={onResetMatch}
      />
    </div>
  );
};

export default ScoreTabContainer;
