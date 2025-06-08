
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import MatchSelection from "./MatchSelection";
import RefereeTabsNavigation from "./components/RefereeTabsNavigation";
import ScoreTab from "./components/tabs/ScoreTab";
import TimerTab from "./components/tabs/TimerTab";
import GoalsTab from "./components/tabs/GoalsTab";
import CardsTab from "./components/tabs/CardsTab";
import TimeTab from "./components/tabs/TimeTab";
import SummaryTab from "./components/tabs/SummaryTab";
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

  // Create simplified handlers for the tabs
  const handleResetMatch = () => {
    resetTimer();
    // Add any other reset logic here
  };

  const handleSaveMatch = () => {
    // Add save match logic here
    console.log('Saving match...');
  };

  const handleAssignGoal = (player: any) => {
    if (!selectedFixtureData) return;
    
    const homeTeam = { 
      id: String(selectedFixtureData.home_team_id || ''), 
      name: selectedFixtureData.home_team?.name || '' 
    };
    const awayTeam = { 
      id: String(selectedFixtureData.away_team_id || ''), 
      name: selectedFixtureData.away_team?.name || '' 
    };
    
    assignGoal(player, matchTime, selectedFixtureData.id, homeTeam, awayTeam);
  };

  // Fixed function signatures to match the expected calls from useGoalHandlers
  const handleAddGoal = (team: 'home' | 'away') => {
    // Add goal logic here
    console.log('Adding goal for team:', team);
  };

  const handleRemoveGoal = (team: 'home' | 'away') => {
    // Remove goal logic here
    console.log('Removing goal for team:', team);
  };

  const handleAddCard = (playerName: string, team: string, cardType: 'yellow' | 'red', time: number) => {
    // Add card logic here
    console.log('Adding card:', { playerName, team, cardType, time });
  };

  const handleAddPlayer = (player: any) => {
    addPlayer(player);
  };

  const handleRemovePlayer = (playerId: number) => {
    removePlayer(playerId);
  };

  const handleTogglePlayerTime = (playerId: number) => {
    togglePlayerTime(playerId);
  };

  const handleExportSummary = () => {
    // Add export summary logic here
    console.log('Exporting summary...');
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
      <h1 className="text-2xl font-bold text-center">Referee Tools</h1>
      
      <MatchSelection
        fixtures={fixtures || []}
        selectedFixture={selectedFixture}
        onFixtureChange={setSelectedFixture}
      />

      {/* Data validation alerts */}
      {selectedFixture && !enhancedPlayersData.hasValidData && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p>Issues detected with player data:</p>
              <ul className="list-disc list-inside text-sm">
                {enhancedPlayersData.dataIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {selectedFixture && (
        <Tabs defaultValue="score" className="w-full">
          <RefereeTabsNavigation />
          
          <TabsContent value="score" className="mt-6">
            <ScoreTab
              homeScore={homeScore}
              awayScore={awayScore}
              selectedFixtureData={selectedFixtureData}
              isRunning={isRunning}
              onToggleTimer={toggleTimer}
              onResetMatch={handleResetMatch}
              onSaveMatch={handleSaveMatch}
            />
          </TabsContent>

          <TabsContent value="timer" className="mt-6">
            <TimerTab
              selectedFixtureData={selectedFixtureData}
              homeScore={homeScore}
              awayScore={awayScore}
              matchTime={matchTime}
              isRunning={isRunning}
              formatTime={formatTime}
              onToggleTimer={toggleTimer}
              onResetMatch={handleResetMatch}
            />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <GoalsTab
              allPlayers={allPlayers}
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              goals={goals}
              selectedPlayer={selectedGoalPlayer}
              selectedGoalType={selectedGoalType}
              selectedGoalTeam={selectedGoalTeam}
              matchTime={matchTime}
              onPlayerSelect={setSelectedGoalPlayer}
              onGoalTypeChange={setSelectedGoalType}
              onGoalTeamChange={setSelectedGoalTeam}
              onAssignGoal={handleAssignGoal}
              formatTime={formatTime}
              homeScore={homeScore}
              awayScore={awayScore}
              selectedFixtureData={selectedFixtureData}
            />
          </TabsContent>

          <TabsContent value="cards" className="mt-6">
            <CardsTab
              allPlayers={allPlayers}
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              cards={cards}
              selectedPlayer={selectedPlayer}
              selectedTeam={selectedTeam}
              selectedCardType={selectedCardType}
              matchTime={matchTime}
              selectedFixtureData={selectedFixtureData}
              onPlayerSelect={setSelectedPlayer}
              onTeamChange={setSelectedTeam}
              onCardTypeChange={setSelectedCardType}
              formatTime={formatTime}
            />
          </TabsContent>

          <TabsContent value="time" className="mt-6">
            <TimeTab
              allPlayers={allPlayers}
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              trackedPlayers={trackedPlayers}
              selectedPlayer={selectedTimePlayer}
              selectedTimeTeam={selectedTimeTeam}
              matchTime={matchTime}
              onPlayerSelect={setSelectedTimePlayer}
              onTimeTeamChange={setSelectedTimeTeam}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onTogglePlayerTime={handleTogglePlayerTime}
              formatTime={formatTime}
              selectedFixtureData={selectedFixtureData}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <SummaryTab
              matchTime={matchTime}
              homeScore={homeScore}
              awayScore={awayScore}
              goals={goals}
              cards={cards}
              trackedPlayers={trackedPlayers}
              events={events}
              allPlayers={allPlayers}
              selectedFixtureData={selectedFixtureData}
              formatTime={formatTime}
              onExportSummary={handleExportSummary}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RefereeToolsContainer;
