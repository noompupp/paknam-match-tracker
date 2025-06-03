
import { useState } from "react";
import { useFixtures } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useCreateMatchEvent, useUpdatePlayerStats } from "@/hooks/useMatchEvents";
import { useToast } from "@/hooks/use-toast";
import { useMatchTimer } from "@/hooks/useMatchTimer";
import { useScoreManagement } from "@/hooks/useScoreManagement";
import { useCardManagementDropdown } from "@/hooks/useCardManagementDropdown";
import { usePlayerTracking } from "@/hooks/usePlayerTracking";
import { useGoalManagement } from "@/hooks/useGoalManagement";
import { useLocalMatchEvents } from "@/hooks/useMatchEvents";
import MatchSelection from "./MatchSelection";
import MatchTimer from "./MatchTimer";
import ScoreManagement from "./ScoreManagement";
import CardManagementDropdown from "./CardManagementDropdown";
import PlayerTimeTracker from "./PlayerTimeTracker";
import MatchEvents from "./MatchEvents";
import GoalAssignment from "./GoalAssignment";
import MatchSummary from "./MatchSummary";
import StatsManagement from "./StatsManagement";

// Define consistent Player interface for this component - using number and position as required
interface ComponentPlayer {
  id: number;
  name: string;
  team: string;
  number: number; // Made required to match expected Player type
  position: string; // Made required to match expected Player type
}

// Player interface that matches exactly what PlayerTimeTracker expects
interface PlayerTimeTrackerPlayer {
  id: number;
  name: string;
  team: string;
  number: number; // Required for PlayerTimeTracker
  position: string;
}

const RefereeToolsContainer = () => {
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  const { data: members } = useMembers();
  const updateFixtureScore = useUpdateFixtureScore();
  const createMatchEvent = useCreateMatchEvent();
  const updatePlayerStats = useUpdatePlayerStats();
  const { toast } = useToast();

  const [selectedFixture, setSelectedFixture] = useState("");
  const [saveAttempts, setSaveAttempts] = useState(0);

  // Custom hooks
  const { matchTime, isRunning, toggleTimer, resetTimer, formatTime } = useMatchTimer();
  const { homeScore, awayScore, addGoal, removeGoal, resetScore } = useScoreManagement();
  const { 
    cards, 
    selectedPlayer, 
    selectedTeam, 
    selectedCardType,
    setSelectedPlayer, 
    setSelectedTeam, 
    setSelectedCardType,
    addCard, 
    resetCards,
    checkForSecondYellow 
  } = useCardManagementDropdown();
  const { 
    trackedPlayers, 
    selectedPlayer: selectedTimePlayer, 
    setSelectedPlayer: setSelectedTimePlayer, 
    addPlayer, 
    removePlayer, 
    togglePlayerTime, 
    resetTracking,
    getPlayersNeedingAttention 
  } = usePlayerTracking(isRunning);
  const { goals, selectedGoalPlayer, selectedGoalType, setSelectedGoalPlayer, setSelectedGoalType, assignGoal, resetGoals } = useGoalManagement();
  const { events, addEvent, resetEvents } = useLocalMatchEvents();

  const selectedFixtureData = fixtures?.find(f => f.id.toString() === selectedFixture);
  
  // Get all players from both teams of the selected fixture - create ComponentPlayer objects with required number and position
  const allPlayers: ComponentPlayer[] = members?.filter(member => 
    selectedFixtureData && (
      member.team_id === selectedFixtureData.home_team_id || 
      member.team_id === selectedFixtureData.away_team_id
    )
  ).map(member => ({
    id: member.id,
    name: member.name,
    team: member.team?.name || '',
    number: typeof member.number === 'number' ? member.number : parseInt(String(member.number || '0')), // Ensure number type and required
    position: member.position || 'Player' // Ensure position is always a string, never undefined
  })) || [];

  // Create players specifically for PlayerTimeTracker with the exact interface it expects
  const playersForTimeTracker: PlayerTimeTrackerPlayer[] = members?.filter(member => 
    selectedFixtureData && (
      member.team_id === selectedFixtureData.home_team_id || 
      member.team_id === selectedFixtureData.away_team_id
    )
  ).map(member => ({
    id: member.id,
    name: member.name,
    team: member.team?.name || '',
    number: typeof member.number === 'number' ? member.number : parseInt(String(member.number || '0')), // Ensure number type
    position: member.position || 'Player'
  })) || [];

  // Match handlers
  const handleAddGoal = (team: 'home' | 'away') => {
    addGoal(team);
    const goalText = team === 'home' 
      ? `Goal for ${selectedFixtureData?.home_team?.name}`
      : `Goal for ${selectedFixtureData?.away_team?.name}`;
    addEvent('Goal', goalText, matchTime);
  };

  const handleToggleTimer = () => {
    toggleTimer();
    const action = isRunning ? 'paused' : 'started';
    addEvent('Timer', `Match timer ${action} at ${formatTime(matchTime)}`, matchTime);
  };

  const handleResetMatch = () => {
    resetTimer();
    resetScore();
    resetEvents();
    resetCards();
    resetTracking();
    resetGoals();
    addEvent('Reset', 'Match reset', 0);
  };

  const handleSaveMatch = async () => {
    if (!selectedFixtureData) return;
    
    setSaveAttempts(prev => prev + 1);
    
    try {
      await updateFixtureScore.mutateAsync({
        id: selectedFixtureData.id,
        homeScore,
        awayScore
      });
      
      addEvent('Save', `Match saved with score ${homeScore}-${awayScore}`, matchTime);
      toast({
        title: "Match Saved",
        description: `Score updated: ${homeScore}-${awayScore}`,
      });
    } catch (error) {
      console.error('Failed to save match:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save match. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Player management handlers
  const handleAssignGoal = async (player: ComponentPlayer) => {
    if (!selectedFixtureData) return;
    
    try {
      const newGoal = await assignGoal(player, matchTime, selectedFixtureData.id, player.team === selectedFixtureData.home_team?.name ? selectedFixtureData.home_team_id : selectedFixtureData.away_team_id);
      if (newGoal) {
        addEvent('Goal Assignment', `${selectedGoalType} assigned to ${player.name}`, matchTime);
        toast({
          title: "Goal Assigned",
          description: `${selectedGoalType} assigned to ${player.name}`,
        });
      }
    } catch (error) {
      console.error('Failed to assign goal:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddCard = (playerName: string, team: string, cardType: "yellow" | "red", time: number) => {
    const player = allPlayers.find(p => p.name === playerName);
    if (!player) return;

    const cardResult = addCard(player, team, matchTime, cardType);
    addEvent('Card', `${cardType} card for ${playerName} (${team})`, matchTime);
    
    if (cardResult && cardResult.isSecondYellow) {
      addEvent('Red Card', `Second yellow card - automatic red for ${playerName}`, matchTime);
      toast({
        title: "Second Yellow Card",
        description: `${playerName} receives automatic red card for second yellow`,
        variant: "destructive"
      });
    }
  };

  const handleAddPlayer = (player: ComponentPlayer) => {
    addPlayer(player, matchTime);
    addEvent('Player Added', `${player.name} started tracking`, matchTime);
  };

  const handleRemovePlayer = (playerId: number) => {
    const player = playersForTimeTracker.find(p => p.id === playerId);
    if (player) {
      removePlayer(playerId); // Fixed: removePlayer expects only playerId
      addEvent('Player Removed', `${player.name} stopped tracking`, matchTime);
    }
  };

  const handleTogglePlayerTime = (playerId: number) => {
    const player = playersForTimeTracker.find(p => p.id === playerId);
    if (player) {
      const result = togglePlayerTime(playerId, matchTime);
      const action = result ? 'started' : 'stopped';
      addEvent('Player Time', `${player.name} ${action} playing`, matchTime);
    }
  };

  // Export match summary function
  const handleExportSummary = () => {
    const summaryData = {
      fixture: selectedFixtureData,
      score: `${homeScore}-${awayScore}`,
      duration: formatTime(matchTime),
      events,
      goals,
      cards,
      playerTimes: trackedPlayers
    };
    
    // Create downloadable JSON file
    const dataStr = JSON.stringify(summaryData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `match-summary-${selectedFixtureData?.home_team?.name}-vs-${selectedFixtureData?.away_team?.name}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Match Summary Exported",
      description: "Match summary has been downloaded as JSON file.",
    });
  };

  // Check for players needing attention (updated for 7-a-side rules)
  const playersNeedingAttention = getPlayersNeedingAttention(playersForTimeTracker, matchTime);

  if (fixturesLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center pb-20">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-center text-white mb-6">
          <h1 className="text-3xl font-bold">Referee Tools - 7-a-Side</h1>
          <p className="text-white/80 mt-2">Manage 50-minute matches with role-based playtime rules</p>
          {saveAttempts > 0 && (
            <p className="text-yellow-300 text-sm mt-1">
              Save attempts: {saveAttempts} {saveAttempts >= 3 && "(Multiple failures detected)"}
            </p>
          )}
          {playersNeedingAttention.length > 0 && (
            <div className="bg-orange-500/20 border border-orange-400 rounded-lg p-3 mt-2">
              <p className="text-orange-100 text-sm">
                ⚠️ {playersNeedingAttention.length} player(s) need attention due to 7-a-side time rules
              </p>
            </div>
          )}
        </div>

        <MatchSelection
          fixtures={fixtures || []}
          selectedFixture={selectedFixture}
          onFixtureChange={setSelectedFixture}
        />

        {selectedFixtureData && (
          <>
            <MatchTimer
              selectedFixtureData={selectedFixtureData}
              homeScore={homeScore}
              awayScore={awayScore}
              matchTime={matchTime}
              isRunning={isRunning}
              formatTime={formatTime}
            />

            <ScoreManagement
              selectedFixtureData={selectedFixtureData}
              homeScore={homeScore}
              awayScore={awayScore}
              isRunning={isRunning}
              isPending={updateFixtureScore.isPending}
              onAddGoal={handleAddGoal}
              onRemoveGoal={removeGoal}
              onToggleTimer={handleToggleTimer}
              onResetMatch={handleResetMatch}
              onSaveMatch={handleSaveMatch}
            />

            <GoalAssignment
              allPlayers={allPlayers}
              goals={goals}
              selectedPlayer={selectedGoalPlayer}
              selectedGoalType={selectedGoalType}
              matchTime={matchTime}
              onPlayerSelect={setSelectedGoalPlayer}
              onGoalTypeChange={setSelectedGoalType}
              onAssignGoal={() => selectedGoalPlayer && handleAssignGoal(selectedGoalPlayer)}
              formatTime={formatTime}
            />

            <CardManagementDropdown
              selectedFixtureData={selectedFixtureData}
              allPlayers={allPlayers}
              selectedPlayer={selectedPlayer}
              selectedTeam={selectedTeam}
              selectedCardType={selectedCardType}
              cards={cards}
              onPlayerSelect={setSelectedPlayer}
              onTeamChange={setSelectedTeam}
              onCardTypeChange={setSelectedCardType}
              onAddCard={() => selectedPlayer && selectedTeam && selectedCardType && handleAddCard(selectedPlayer, selectedTeam, selectedCardType, matchTime)}
              formatTime={formatTime}
            />

            <PlayerTimeTracker
              trackedPlayers={trackedPlayers}
              selectedPlayer={selectedTimePlayer}
              allPlayers={playersForTimeTracker}
              onPlayerSelect={setSelectedTimePlayer}
              onAddPlayer={() => selectedTimePlayer && handleAddPlayer(selectedTimePlayer)}
              onRemovePlayer={handleRemovePlayer}
              onTogglePlayerTime={handleTogglePlayerTime}
              formatTime={formatTime}
              matchTime={matchTime}
            />

            <StatsManagement />

            <MatchSummary
              selectedFixtureData={selectedFixtureData}
              homeScore={homeScore}
              awayScore={awayScore}
              matchTime={matchTime}
              events={events}
              goals={goals}
              cards={cards}
              trackedPlayers={trackedPlayers}
              allPlayers={allPlayers}
              onExportSummary={handleExportSummary}
              formatTime={formatTime}
            />

            <MatchEvents
              events={events}
              formatTime={formatTime}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RefereeToolsContainer;
