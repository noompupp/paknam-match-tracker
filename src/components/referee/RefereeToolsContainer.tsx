
import RefereeToolsHeader from "./components/RefereeToolsHeader";
import RefereeMainContent from "./components/RefereeMainContent";
import RefereePageContainer from "./shared/RefereePageContainer";
import EnhancedWorkflowModeManager from "./workflows/EnhancedWorkflowModeManager";
import { useRefereeStateOrchestrator } from "./hooks/useRefereeStateOrchestrator";
import { useState } from "react";

interface EnhancedWorkflowConfig {
  mode: 'two_referees' | 'multi_referee';
  fixtureId: number;
  userAssignments: any[];
  allAssignments: any[];
}

const RefereeToolsContainer = () => {
  const [workflowConfig, setWorkflowConfig] = useState<EnhancedWorkflowConfig | null>(null);

  const {
    // Base state
    fixtures,
    fixturesLoading,
    selectedFixture,
    setSelectedFixture,
    selectedFixtureData,
    enhancedPlayersData,
    
    // Player data
    allPlayers,
    homeTeamPlayers,
    awayTeamPlayers,
    
    // Team selections
    selectedGoalTeam,
    setSelectedGoalTeam,
    selectedTimeTeam,
    setSelectedTimeTeam,
    
    // Timer
    matchTime,
    isRunning,
    formatTime,
    
    // Score - now manual only
    homeScore,
    awayScore,
    
    // Goals
    goals,
    selectedGoalPlayer,
    selectedGoalType,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    
    // Cards
    cards,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    
    // Time tracking
    trackedPlayers,
    selectedTimePlayer,
    setSelectedTimePlayer,
    
    // Events
    events,
    
    // Save attempts
    saveAttempts,
    
    // Handlers
    handleSaveMatch,
    handleResetMatch,
    handleAssignGoal,
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    toggleTimer,
    resetTimer,
    assignGoal,
    removePlayer,
    addPlayer,
    
    // Manual data management
    handleManualRefresh
  } = useRefereeStateOrchestrator();

  const handleWorkflowConfigured = (config: EnhancedWorkflowConfig) => {
    console.log('🎯 Enhanced workflow configured in container:', config);
    setWorkflowConfig(config);
  };

  console.log('🎮 RefereeToolsContainer: Enhanced workflow system active:', {
    selectedGoalTeam,
    selectedTimeTeam,
    homePlayersCount: homeTeamPlayers?.length || 0,
    awayPlayersCount: awayTeamPlayers?.length || 0,
    hasValidData: enhancedPlayersData.hasValidData,
    manualScore: { homeScore, awayScore },
    workflowConfigured: !!workflowConfig,
    userAssignments: workflowConfig?.userAssignments?.length || 0,
    allAssignments: workflowConfig?.allAssignments?.length || 0
  });

  if (fixturesLoading) {
    return (
      <RefereePageContainer>
        <div className="flex items-center justify-center h-32">
          <p>Loading fixtures...</p>
        </div>
      </RefereePageContainer>
    );
  }

  return (
    <RefereePageContainer>
      <RefereeToolsHeader
        fixtures={fixtures || []}
        selectedFixture={selectedFixture}
        onFixtureChange={setSelectedFixture}
        enhancedPlayersData={enhancedPlayersData}
      />

      {selectedFixture && !workflowConfig && (
        <div className="container mx-auto p-4">
          <EnhancedWorkflowModeManager
            selectedFixtureData={selectedFixtureData}
            onWorkflowConfigured={handleWorkflowConfigured}
          />
        </div>
      )}

      {selectedFixture && workflowConfig && (
        <div className="container mx-auto p-4">
          <RefereeMainContent
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
            saveAttempts={Array.isArray(saveAttempts) ? saveAttempts : []}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            assignGoal={handleAssignGoal}
            addPlayer={handleAddPlayer}
            removePlayer={removePlayer}
            togglePlayerTime={handleTogglePlayerTime}
            onSaveMatch={handleSaveMatch}
            onResetMatch={handleResetMatch}
            onDataRefresh={handleManualRefresh}
            workflowConfig={workflowConfig}
          />
        </div>
      )}
    </RefereePageContainer>
  );
};

export default RefereeToolsContainer;
