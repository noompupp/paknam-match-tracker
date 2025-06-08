
import RefereeToolsHeader from "./components/RefereeToolsHeader";
import RefereeToolsMain from "./components/RefereeToolsMain";
import { useRefereeState } from "./hooks/useRefereeState";
import { useRefereeHandlers } from "./hooks/useRefereeHandlers";

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
    playersForTimeTracker,
    
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
    addGoal,
    removeGoal,
    resetScore,
    
    // Goal state
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    assignGoal,
    resetGoals,
    
    // Card state
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    addCard,
    resetCards,
    
    // Player tracking state
    trackedPlayers,
    selectedTimePlayer,
    setSelectedTimePlayer,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    resetTracking,
    
    // Events
    events,
    addEvent,
    resetEvents,
    
    // Enhanced data status
    enhancedPlayersData,
    
    // Save attempts tracking
    saveAttempts,
    setSaveAttempts,
    
    // Database mutation hooks
    updateFixtureScore,
    createMatchEvent,
    updatePlayerStats
  } = useRefereeState();

  console.log('🎮 RefereeToolsContainer: Enhanced team selection state:', {
    selectedGoalTeam,
    selectedTimeTeam,
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    hasValidData: enhancedPlayersData.hasValidData
  });

  // Use the comprehensive referee handlers
  const {
    handleSaveMatch,
    handleResetMatch,
    handleAssignGoal,
    handleAddCard,
    handleAddPlayer: handleAddPlayerWithSave,
    handleRemovePlayer,
    handleTogglePlayerTime: handleTogglePlayerTimeWithSave
  } = useRefereeHandlers({
    selectedFixtureData,
    matchTime,
    isRunning,
    formatTime,
    homeScore,
    awayScore,
    allPlayers,
    playersForTimeTracker,
    selectedGoalPlayer,
    selectedGoalType,
    selectedTimePlayer,
    saveAttempts,
    setSaveAttempts,
    updateFixtureScore,
    createMatchEvent,
    updatePlayerStats,
    goals,
    addGoal,
    toggleTimer,
    resetTimer,
    resetScore,
    resetEvents,
    resetCards,
    resetTracking,
    resetGoals,
    addEvent,
    assignGoal,
    addCard,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    checkForSecondYellow: () => false, // Placeholder
    removeGoal
  });

  // Create wrapper functions that handle matchTime internally for basic operations
  const handleAddPlayer = (player: any) => {
    addPlayer(player, matchTime);
  };

  const handleTogglePlayerTime = (playerId: number) => {
    togglePlayerTime(playerId, matchTime);
  };

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
        <div className="space-y-4">
          {/* Enhanced save controls with proper database integration */}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Match Control</h3>
                <p className="text-sm text-muted-foreground">
                  Save attempts: {saveAttempts} | Score: {homeScore}-{awayScore}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveMatch}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Save Match Data
                </button>
                <button
                  onClick={handleResetMatch}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                >
                  Reset Match
                </button>
              </div>
            </div>
          </div>

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
            assignGoal={handleAssignGoal}
            addPlayer={handleAddPlayer}
            removePlayer={removePlayer}
            togglePlayerTime={handleTogglePlayerTime}
          />
        </div>
      )}
    </div>
  );
};

export default RefereeToolsContainer;
