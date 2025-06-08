
import { Tabs, TabsContent } from "@/components/ui/tabs";
import RefereeTabsNavigation from "./RefereeTabsNavigation";
import ScoreTab from "./tabs/ScoreTab";
import TimerTab from "./tabs/TimerTab";
import GoalsTab from "./tabs/GoalsTab";
import CardsTab from "./tabs/CardsTab";
import TimeTab from "./tabs/TimeTab";
import SummaryTab from "./tabs/SummaryTab";
import { ComponentPlayer } from "../hooks/useRefereeState";
import { useRefereeMatchHandlers } from "./RefereeMatchHandlers";

interface RefereeToolsMainProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ComponentPlayer[];
  homeTeamPlayers: ComponentPlayer[];
  awayTeamPlayers: ComponentPlayer[];
  goals: any[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  setSelectedGoalPlayer: (value: string) => void;
  setSelectedGoalType: (value: 'goal' | 'assist') => void;
  setSelectedGoalTeam: (value: string) => void;
  cards: any[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  setSelectedPlayer: (value: string) => void;
  setSelectedTeam: (value: string) => void;
  setSelectedCardType: (value: 'yellow' | 'red') => void;
  trackedPlayers: any[];
  selectedTimePlayer: string;
  selectedTimeTeam: string;
  setSelectedTimePlayer: (value: string) => void;
  setSelectedTimeTeam: (value: string) => void;
  events: any[];
  toggleTimer: () => void;
  resetTimer: () => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  addPlayer: (player: ComponentPlayer) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
}

const RefereeToolsMain = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  isRunning,
  formatTime,
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  goals,
  selectedGoalPlayer,
  selectedGoalType,
  selectedGoalTeam,
  setSelectedGoalPlayer,
  setSelectedGoalType,
  setSelectedGoalTeam,
  cards,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  setSelectedPlayer,
  setSelectedTeam,
  setSelectedCardType,
  trackedPlayers,
  selectedTimePlayer,
  selectedTimeTeam,
  setSelectedTimePlayer,
  setSelectedTimeTeam,
  events,
  toggleTimer,
  resetTimer,
  assignGoal,
  addPlayer,
  removePlayer,
  togglePlayerTime
}: RefereeToolsMainProps) => {
  const {
    handleResetMatch,
    handleSaveMatch,
    handleAssignGoal,
    handleAddGoal,
    handleRemoveGoal,
    handleAddCard,
    handleExportSummary
  } = useRefereeMatchHandlers({
    selectedFixtureData,
    matchTime,
    resetTimer,
    assignGoal
  });

  const handleAddPlayer = (player: ComponentPlayer) => {
    addPlayer(player);
  };

  const handleRemovePlayer = (playerId: number) => {
    removePlayer(playerId);
  };

  const handleTogglePlayerTime = (playerId: number) => {
    togglePlayerTime(playerId);
  };

  return (
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
  );
};

export default RefereeToolsMain;
