
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScoreManagement from "../ScoreManagement";
import MatchTimer from "../MatchTimer";
import GoalAssignment from "../GoalAssignment";
import CardManagement from "../CardManagement";
import PlayerTimeTracker from "../PlayerTimeTracker";
import MatchEvents from "../MatchEvents";
import EnhancedMatchSummary from "../EnhancedMatchSummary";
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
  playersForTimeTracker,
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
  updateFixtureScore,
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
      <Card className="card-shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {selectedFixtureData?.home_team?.name} vs {selectedFixtureData?.away_team?.name}
          </CardTitle>
          <p className="text-muted-foreground">
            Match Date: {selectedFixtureData?.match_date} | Venue: {selectedFixtureData?.venue || 'TBD'}
          </p>
        </CardHeader>
      </Card>

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
          <ScoreManagement
            selectedFixtureData={selectedFixtureData}
            homeScore={homeScore}
            awayScore={awayScore}
            isRunning={isRunning}
            isPending={false}
            onAddGoal={onAddGoal}
            onRemoveGoal={onRemoveGoal}
            onToggleTimer={onToggleTimer}
            onResetMatch={onResetMatch}
            onSaveMatch={onSaveMatch}
          />
        </TabsContent>

        <TabsContent value="timer">
          <MatchTimer
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
          <GoalAssignment
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
          <CardManagement
            selectedFixtureData={selectedFixtureData}
            playerName={selectedPlayer}
            selectedTeam={selectedTeam}
            cards={cards}
            onPlayerNameChange={setSelectedPlayer}
            onTeamChange={setSelectedTeam}
            onAddCard={(type: 'yellow' | 'red') => {
              onAddCard(selectedPlayer, selectedTeam, type, matchTime);
            }}
            formatTime={formatTime}
          />
        </TabsContent>

        <TabsContent value="time">
          <PlayerTimeTracker
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
          <div className="space-y-6">
            <EnhancedMatchSummary
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
            
            {/* Traditional Match Events */}
            <MatchEvents
              events={events}
              formatTime={formatTime}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefereeMatchControls;
