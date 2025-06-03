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
import { useMatchHandlers } from "./MatchHandlers";
import { usePlayerManagement } from "./PlayerManagement";
import MatchSelection from "./MatchSelection";
import MatchTimer from "./MatchTimer";
import ScoreManagement from "./ScoreManagement";
import CardManagementDropdown from "./CardManagementDropdown";
import PlayerTimeTracker from "./PlayerTimeTracker";
import MatchEvents from "./MatchEvents";
import GoalAssignment from "./GoalAssignment";

// Define consistent Player interface for this component - using number for consistency
interface ComponentPlayer {
  id: number;
  name: string;
  team: string;
  number?: number; // Changed from string to number for consistency
  position?: string;
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
  
  // Get all players from both teams of the selected fixture - create ComponentPlayer objects with number as number
  const allPlayers: ComponentPlayer[] = members?.filter(member => 
    selectedFixtureData && (
      member.team_id === selectedFixtureData.home_team_id || 
      member.team_id === selectedFixtureData.away_team_id
    )
  ).map(member => ({
    id: member.id,
    name: member.name,
    team: member.team?.name || '',
    number: typeof member.number === 'number' ? member.number : parseInt(String(member.number || '0')), // Convert to number
    position: member.position
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

  // Use match handlers
  const { handleAddGoal, handleToggleTimer, handleResetMatch, handleSaveMatch } = useMatchHandlers({
    selectedFixture,
    selectedFixtureData,
    homeScore,
    awayScore,
    matchTime,
    isRunning,
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
    formatTime
  });

  // Use player management
  const { 
    playersForCards, 
    playersForTracking, 
    handleAssignGoal, 
    handleAddCard, 
    handleAddPlayer, 
    handleRemovePlayer, 
    handleTogglePlayerTime 
  } = usePlayerManagement({
    members: members || [],
    selectedFixtureData,
    allPlayers,
    selectedGoalPlayer,
    selectedGoalType,
    selectedPlayer,
    selectedTeam,
    selectedCardType,
    selectedTimePlayer,
    cards,
    goals,
    matchTime,
    setSelectedGoalPlayer,
    setSelectedGoalType,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedCardType,
    setSelectedTimePlayer,
    assignGoal,
    addCard,
    addPlayer,
    removePlayer,
    togglePlayerTime,
    addEvent,
    checkForSecondYellow,
    formatTime
  });

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
              onAssignGoal={handleAssignGoal}
              formatTime={formatTime}
            />

            <CardManagementDropdown
              selectedFixtureData={selectedFixtureData}
              allPlayers={playersForCards}
              selectedPlayer={selectedPlayer}
              selectedTeam={selectedTeam}
              selectedCardType={selectedCardType}
              cards={cards}
              onPlayerSelect={setSelectedPlayer}
              onTeamChange={setSelectedTeam}
              onCardTypeChange={setSelectedCardType}
              onAddCard={handleAddCard}
              formatTime={formatTime}
            />

            <PlayerTimeTracker
              trackedPlayers={trackedPlayers}
              selectedPlayer={selectedTimePlayer}
              allPlayers={playersForTimeTracker}
              onPlayerSelect={setSelectedTimePlayer}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onTogglePlayerTime={handleTogglePlayerTime}
              formatTime={formatTime}
              matchTime={matchTime}
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
