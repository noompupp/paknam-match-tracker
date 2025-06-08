
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
            />
          </TabsContent>

          <TabsContent value="timer" className="mt-6">
            <TimerTab
              matchTime={matchTime}
              isRunning={isRunning}
              formatTime={formatTime}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
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
              onAssignGoal={assignGoal}
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
              onPlayerSelect={setSelectedPlayer}
              onTeamChange={setSelectedTeam}
              onCardTypeChange={setSelectedCardType}
              formatTime={formatTime}
              selectedFixtureData={selectedFixtureData}
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
              onAddPlayer={() => {}} // This will be handled by the TimeTab component
              onRemovePlayer={() => {}} // This will be handled by the TimeTab component
              onTogglePlayerTime={() => {}} // This will be handled by the TimeTab component
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
              selectedFixtureData={selectedFixtureData}
              formatTime={formatTime}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RefereeToolsContainer;
