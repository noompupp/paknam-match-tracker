
import RefereeToolsHeader from "./components/RefereeToolsHeader";
import RefereeMainContent from "./components/RefereeMainContent";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import EnhancedWorkflowModeManager from "./workflows/EnhancedWorkflowModeManager";
import { useRefereeStateOrchestrator } from "./hooks/useRefereeStateOrchestrator";
import { useState } from "react";
import { WorkflowModeConfig } from "./workflows/types";

const RefereeToolsContainer = () => {
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowModeConfig | null>(null);

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

  const handleWorkflowConfigured = (config: any) => {
    console.log('🎯 Enhanced workflow configured in container:', config);
    
    // Convert the enhanced config to the expected WorkflowModeConfig format
    const workflowModeConfig: WorkflowModeConfig = {
      mode: config.mode,
      fixtureId: config.fixtureId,
      userAssignments: config.userAssignments || [],
      allAssignments: config.allAssignments || [],
      createdAt: config.createdAt || new Date().toISOString(),
      updatedAt: config.updatedAt || new Date().toISOString()
    };
    
    setWorkflowConfig(workflowModeConfig);
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
      <>
        <UnifiedPageHeader 
          title="Referee Tools"
          showLanguageToggle={true}
        />
        <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
          <div className="flex items-center justify-center h-32">
            <p>Loading fixtures...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <UnifiedPageHeader 
        title="Referee Tools"
        showLanguageToggle={true}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
        <RefereeToolsHeader
          fixtures={fixtures || []}
          selectedFixture={selectedFixture}
          onFixtureChange={setSelectedFixture}
          enhancedPlayersData={enhancedPlayersData}
        />

        {selectedFixture && !workflowConfig && (
          <EnhancedWorkflowModeManager
            selectedFixtureData={selectedFixtureData}
            onWorkflowConfigured={handleWorkflowConfigured}
          />
        )}

        {selectedFixture && workflowConfig && (
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
        )}
      </main>
    </>
  );
};

export default RefereeToolsContainer;
