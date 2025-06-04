
import { ComponentPlayer } from "../hooks/useRefereeState";
import NoMatchSelectedPlaceholder from "./NoMatchSelectedPlaceholder";
import MatchHeaderWithScore from "./MatchHeaderWithScore";
import GoalsSummaryDisplay from "./GoalsSummaryDisplay";
import CardsSummaryDisplay from "./CardsSummaryDisplay";
import PlayerTimeTrackingDisplay from "./PlayerTimeTrackingDisplay";

interface EnhancedMatchSummaryDisplayProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  goals: any[];
  cards: any[];
  trackedPlayers: any[];
  allPlayers: ComponentPlayer[];
  formatTime: (seconds: number) => string;
}

const EnhancedMatchSummaryDisplay = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  goals,
  cards,
  trackedPlayers,
  allPlayers,
  formatTime
}: EnhancedMatchSummaryDisplayProps) => {
  if (!selectedFixtureData) {
    return <NoMatchSelectedPlaceholder />;
  }

  // Convert seconds to minutes for display
  const formatTimeInMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}'`;
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <MatchHeaderWithScore
        selectedFixtureData={selectedFixtureData}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        formatTime={formatTimeInMinutes}
      />

      {/* Goals Summary */}
      <GoalsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        goals={goals}
        formatTime={formatTimeInMinutes}
      />

      {/* Cards Summary */}
      <CardsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        cards={cards}
        formatTime={formatTimeInMinutes}
      />

      {/* Player Time Tracking */}
      <PlayerTimeTrackingDisplay
        trackedPlayers={trackedPlayers.map(player => ({
          ...player,
          totalTime: Math.floor(player.totalTime / 60) // Convert seconds to minutes
        }))}
        formatTime={formatTimeInMinutes}
      />
    </div>
  );
};

export default EnhancedMatchSummaryDisplay;
