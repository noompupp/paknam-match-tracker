
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RefereeMatchHeader from "./RefereeMatchHeader";
import ScoreTab from "./tabs/ScoreTab";
import TimerTab from "./tabs/TimerTab";
import GoalsTab from "./tabs/GoalsTab";
import CardsTab from "./tabs/CardsTab";
import TimeTab from "./tabs/TimeTab";
import SummaryTab from "./tabs/SummaryTab";
import { ComponentPlayer, PlayerTimeTrackerPlayer } from "../hooks/useRefereeState";

interface RefereeMatchControlsProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ComponentPlayer[];
  playersForTimeTracker: PlayerTimeTrackerPlayer[];
  goals: any[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  setSelectedGoalPlayer: (value: string) => void;
  setSelectedGoalType: (value: 'goal' | 'assist') => void;
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  setSelectedPlayer: (value: string) => void;
  setSelectedTeam: (value: string) => void;
  setSelectedCardType: (value: 'yellow' | 'red') => void;
  cards: any[];
  trackedPlayers: any[];
  selectedTimePlayer: string;
  setSelectedTimePlayer: (value: string) => void;
  events: any[];
  updateFixtureScore: any;
  onAddGoal: (team: 'home' | 'away') => void;
  onRemoveGoal: (team: 'home' | 'away') => void;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  onAddCard: (playerName: string, team: string, cardType: 'yellow' | 'red', time: number) => void;
  onAddPlayer: (player: ComponentPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  onExportSummary: () => void;
}

const RefereeMatchControls = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  isRunning,
  formatTime,
  allPlayers,
  goals,
  selectedGoalPlayer,
  selectedGoalType,
  setSelectedGoalPlayer,
  setSelectedGoalType,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  setSelectedPlayer,
  setSelectedTeam,
  setSelectedCardType,
  cards,
  trackedPlayers,
  selectedTimePlayer,
  setSelectedTimePlayer,
  events,
  onAddGoal,
  onRemoveGoal,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
  onAssignGoal,
  onAddCard,
  onAddPlayer,
  onRemovePlayer,
  onTogglePlayerTime,
  onExportSummary
}: RefereeMatchControlsProps) => {
  return (
    <div className="space-y-6">
      {/* Match Header */}
      <RefereeMatchHeader selectedFixtureData={selectedFixtureData} />

      {/* Main Control Tabs */}
      <Tabs defaultValue="score" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="score">Score</TabsTrigger>
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="score">
          <ScoreTab
            selectedFixtureData={selectedFixtureData}
            homeScore={homeScore}
            awayScore={awayScore}
            isRunning={isRunning}
            onAddGoal={onAddGoal}
            onRemoveGoal={onRemoveGoal}
            onToggleTimer={onToggleTimer}
            onResetMatch={onResetMatch}
            onSaveMatch={onSaveMatch}
          />
        </TabsContent>

        <TabsContent value="timer">
          <TimerTab
            selectedFixtureData={selectedFixtureData}
            homeScore={homeScore}
            awayScore={awayScore}
            matchTime={matchTime}
            isRunning={isRunning}
            formatTime={formatTime}
            onToggleTimer={onToggleTimer}
            onResetMatch={onResetMatch}
          />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsTab
            allPlayers={allPlayers}
            goals={goals}
            selectedPlayer={selectedGoalPlayer}
            selectedGoalType={selectedGoalType}
            matchTime={matchTime}
            onPlayerSelect={setSelectedGoalPlayer}
            onGoalTypeChange={setSelectedGoalType}
            onAssignGoal={() => {
              const player = allPlayers.find(p => p.id.toString() === selectedGoalPlayer);
              if (player) {
                onAssignGoal(player);
              }
            }}
            formatTime={formatTime}
          />
        </TabsContent>

        <TabsContent value="cards">
          <CardsTab
            selectedFixtureData={selectedFixtureData}
            allPlayers={allPlayers}
            selectedPlayer={selectedPlayer}
            selectedTeam={selectedTeam}
            selectedCardType={selectedCardType}
            cards={cards}
            onPlayerSelect={setSelectedPlayer}
            onTeamChange={setSelectedTeam}
            onCardTypeChange={setSelectedCardType}
            onAddCard={() => {
              const player = allPlayers.find(p => p.id.toString() === selectedPlayer);
              if (player) {
                onAddCard(player.name, selectedTeam, selectedCardType, matchTime);
              }
            }}
            formatTime={formatTime}
          />
        </TabsContent>

        <TabsContent value="time">
          <TimeTab
            allPlayers={allPlayers}
            trackedPlayers={trackedPlayers}
            selectedPlayer={selectedTimePlayer}
            onPlayerSelect={setSelectedTimePlayer}
            onAddPlayer={() => {
              const player = allPlayers.find(p => p.id.toString() === selectedTimePlayer);
              if (player) {
                onAddPlayer(player);
              }
            }}
            onRemovePlayer={onRemovePlayer}
            onTogglePlayerTime={onTogglePlayerTime}
            formatTime={formatTime}
            matchTime={matchTime}
          />
        </TabsContent>

        <TabsContent value="summary">
          <SummaryTab
            selectedFixtureData={selectedFixtureData}
            homeScore={homeScore}
            awayScore={awayScore}
            matchTime={matchTime}
            events={events}
            goals={goals}
            cards={cards}
            trackedPlayers={trackedPlayers}
            allPlayers={allPlayers}
            onExportSummary={onExportSummary}
            formatTime={formatTime}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefereeMatchControls;
