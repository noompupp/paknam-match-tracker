
import RefereeToolsHeader from "./components/RefereeToolsHeader";
import RefereeToolsMain from "./components/RefereeToolsMain";
import { useRefereeState } from "./hooks/useRefereeState";

const RefereeToolsContainer = () => {
  const {
    // Data
    fixtures,
    fixturesLoading,
    selectedFixture,
    setSelectedFixture,
    selectedFixtureData,
    
    // Enhanced player data with team filtering
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    
    // Team selection for Goals and Time tabs
    selectedGoalTeam,
    setSelectedGoalTeam,
    selectedTimeTeam,
    setSelectedTimeTeam,
    
    // Timer state
    matchTime,
    isRunning,
    toggleTimer,
    resetTimer,
    formatTime,
    
    // Score state
    homeScore,
    awayScore,
    
    // Goal state
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    assignGoal,
    
    // Card state
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    
    // Player tracking state
    trackedPlayers,
    selectedTimePlayer,
    setSelectedTimePlayer,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    
    // Events
    events,
    
    // Enhanced data status
    enhancedPlayersData
  } = useRefereeState();

  console.log('🎮 RefereeToolsContainer: Enhanced team selection state:', {
    selectedGoalTeam,
    selectedTimeTeam,
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    hasValidData: enhancedPlayersData.hasValidData
  });

  if (fixturesLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-32">
          <p>Loading fixtures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <RefereeToolsHeader
        fixtures={fixtures || []}
        selectedFixture={selectedFixture}
        onFixtureChange={setSelectedFixture}
        enhancedPlayersData={enhancedPlayersData}
      />

      {selectedFixture && (
        <RefereeToolsMain
          selectedFixtureData={selectedFixtureData}
          homeScore={homeScore}
          awayScore={awayScore}
          matchTime={matchTime}
          isRunning={isRunning}
          formatTime={formatTime}
          allPlayers={allPlayers}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          goals={goals}
          selectedGoalPlayer={selectedGoalPlayer}
          selectedGoalType={selectedGoalType}
          selectedGoalTeam={selectedGoalTeam}
          setSelectedGoalPlayer={setSelectedGoalPlayer}
          setSelectedGoalType={setSelectedGoalType}
          setSelectedGoalTeam={setSelectedGoalTeam}
          cards={cards}
          selectedPlayer={selectedPlayer}
          selectedTeam={selectedTeam}
          selectedCardType={selectedCardType}
          setSelectedPlayer={setSelectedPlayer}
          setSelectedTeam={setSelectedTeam}
          setSelectedCardType={setSelectedCardType}
          trackedPlayers={trackedPlayers}
          selectedTimePlayer={selectedTimePlayer}
          selectedTimeTeam={selectedTimeTeam}
          setSelectedTimePlayer={setSelectedTimePlayer}
          setSelectedTimeTeam={setSelectedTimeTeam}
          events={events}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          assignGoal={assignGoal}
          addPlayer={addPlayer}
          removePlayer={removePlayer}
          togglePlayerTime={togglePlayerTime}
        />
      )}
    </div>
  );
};

export default RefereeToolsContainer;
