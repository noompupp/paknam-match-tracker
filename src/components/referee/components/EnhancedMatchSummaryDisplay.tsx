
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

  // Enhanced time formatting for better display
  const formatTimeInMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}'`;
  };

  // Calculate actual goals from events for accurate display
  const homeTeamGoals = goals.filter(goal => 
    goal.type === 'goal' && goal.team === selectedFixtureData?.home_team?.name
  );
  
  const awayTeamGoals = goals.filter(goal => 
    goal.type === 'goal' && goal.team === selectedFixtureData?.away_team?.name
  );

  const totalAssists = goals.filter(goal => goal.type === 'assist');

  console.log('📊 EnhancedMatchSummaryDisplay: Rendering with enhanced data and database integration:', {
    fixture: selectedFixtureData.id,
    homeScore,
    awayScore,
    homeGoalsCount: homeTeamGoals.length,
    awayGoalsCount: awayTeamGoals.length,
    assistsCount: totalAssists.length,
    cardsCount: cards.length,
    trackedPlayersCount: trackedPlayers.length,
    fixtureId: selectedFixtureData.id
  });

  return (
    <div className="space-y-6">
      {/* Match Header with Real-time Score */}
      <MatchHeaderWithScore
        selectedFixtureData={selectedFixtureData}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        formatTime={formatTimeInMinutes}
      />

      {/* Goals Summary with Enhanced Display and Database Integration */}
      <GoalsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        goals={goals}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />

      {/* Cards Summary with Database Integration */}
      <CardsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        cards={cards}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />

      {/* Player Time Tracking with Minutes Conversion and Database Integration */}
      <PlayerTimeTrackingDisplay
        trackedPlayers={trackedPlayers.map(player => ({
          ...player,
          totalTime: Math.floor(player.totalTime / 60), // Convert seconds to minutes for display
          displayTime: formatTimeInMinutes(player.totalTime) // Add formatted display time
        }))}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />
    </div>
  );
};

export default EnhancedMatchSummaryDisplay;
