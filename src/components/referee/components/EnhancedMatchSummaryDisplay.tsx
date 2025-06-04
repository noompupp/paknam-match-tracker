
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

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <MatchHeaderWithScore
        selectedFixtureData={selectedFixtureData}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        formatTime={formatTime}
      />

      {/* Goals Summary */}
      <GoalsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        goals={goals}
        formatTime={formatTime}
      />

      {/* Cards Summary */}
      <CardsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        cards={cards}
        formatTime={formatTime}
      />

      {/* Player Time Tracking */}
      <PlayerTimeTrackingDisplay
        trackedPlayers={trackedPlayers}
        formatTime={formatTime}
      />
    </div>
  );
};

export default EnhancedMatchSummaryDisplay;
