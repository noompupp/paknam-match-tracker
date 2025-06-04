
import { ComponentPlayer } from "../hooks/useRefereeState";
import { useEnhancedMatchData } from "@/hooks/useEnhancedMatchData";
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
  // Use enhanced match data if available
  const { data: enhancedData, isLoading: enhancedLoading } = useEnhancedMatchData(selectedFixtureData?.id);

  if (!selectedFixtureData) {
    return <NoMatchSelectedPlaceholder />;
  }

  // Enhanced time formatting for better display
  const formatTimeInMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}'`;
  };

  // Use enhanced data if available, fallback to local data
  const displayGoals = enhancedData?.goals.length ? enhancedData.goals : goals;
  const displayCards = enhancedData?.cards.length ? enhancedData.cards : cards;
  const displayPlayerTimes = enhancedData?.playerTimes.length ? enhancedData.playerTimes : trackedPlayers;

  // Calculate scores from actual goals if using enhanced data
  const actualHomeScore = enhancedData?.statistics.homeTeamGoals ?? homeScore;
  const actualAwayScore = enhancedData?.statistics.awayTeamGoals ?? awayScore;

  console.log('📊 EnhancedMatchSummaryDisplay: Rendering with enhanced integration:', {
    fixture: selectedFixtureData.id,
    enhancedDataAvailable: !!enhancedData,
    enhancedLoading,
    localData: {
      goals: goals.length,
      cards: cards.length,
      trackedPlayers: trackedPlayers.length
    },
    enhancedData: enhancedData ? {
      goals: enhancedData.goals.length,
      cards: enhancedData.cards.length,
      playerTimes: enhancedData.playerTimes.length,
      statistics: enhancedData.statistics
    } : null,
    displayData: {
      goals: displayGoals.length,
      cards: displayCards.length,
      playerTimes: displayPlayerTimes.length
    }
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Match Header with Database Integration */}
      <MatchHeaderWithScore
        selectedFixtureData={selectedFixtureData}
        homeScore={actualHomeScore}
        awayScore={actualAwayScore}
        matchTime={matchTime}
        formatTime={formatTimeInMinutes}
      />

      {/* Enhanced Goals Summary with Rich Event Details */}
      <GoalsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        goals={displayGoals}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />

      {/* Enhanced Cards Summary with Comprehensive Details */}
      <CardsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        cards={displayCards}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />

      {/* Enhanced Player Time Tracking with Aggregated Data */}
      <PlayerTimeTrackingDisplay
        trackedPlayers={displayPlayerTimes.map(player => ({
          ...player,
          totalTime: (player.totalMinutes || player.totalTime || 0) * (player.totalMinutes ? 60 : 1), // Convert minutes to seconds if needed
          displayTime: formatTimeInMinutes((player.totalMinutes || player.totalTime || 0) * (player.totalMinutes ? 60 : 1))
        }))}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />

      {/* Enhanced Data Status Indicator */}
      {enhancedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-semibold text-green-800 mb-2">Enhanced Data Active</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-green-700">
            <div>Goals: {enhancedData.statistics.homeTeamGoals + enhancedData.statistics.awayTeamGoals}</div>
            <div>Cards: {enhancedData.statistics.homeTeamCards + enhancedData.statistics.awayTeamCards}</div>
            <div>Players: {enhancedData.statistics.totalPlayersTracked}</div>
            <div>Minutes: {enhancedData.statistics.totalMinutesPlayed}</div>
          </div>
        </div>
      )}

      {enhancedLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">Loading enhanced match data...</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedMatchSummaryDisplay;
