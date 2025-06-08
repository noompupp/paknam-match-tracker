
import { TabsContent } from "@/components/ui/tabs";
import ScoreTab from "./tabs/ScoreTab";
import TimerTab from "./tabs/TimerTab";
import GoalsTab from "./tabs/GoalsTab";
import CardsTab from "./tabs/CardsTab";
import EnhancedTimeTab from "./tabs/EnhancedTimeTab";
import SummaryTab from "./tabs/SummaryTab";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface RefereeTabsContentProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  goals: any[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  setSelectedGoalPlayer: (value: string) => void;
  setSelectedGoalType: (value: 'goal' | 'assist') => void;
  setSelectedGoalTeam: (value: string) => void;
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  setSelectedPlayer: (value: string) => void;
  setSelectedTeam: (value: string) => void;
  setSelectedCardType: (value: 'yellow' | 'red') => void;
  cards: any[];
  trackedPlayers: any[];
  selectedTimePlayer: string;
  selectedTimeTeam: string;
  setSelectedTimePlayer: (value: string) => void;
  setSelectedTimeTeam: (value: string) => void;
  events: any[];
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

const RefereeTabsContent = ({
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
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  setSelectedPlayer,
  setSelectedTeam,
  setSelectedCardType,
  cards,
  trackedPlayers,
  selectedTimePlayer,
  selectedTimeTeam,
  setSelectedTimePlayer,
  setSelectedTimeTeam,
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
}: RefereeTabsContentProps) => {
  return (
    <>
      <TabsContent value="score">
        <ScoreTab
          selectedFixtureData={selectedFixtureData}
          homeScore={homeScore}
          awayScore={awayScore}
          isRunning={isRunning}
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
          onAssignGoal={onAssignGoal}
          formatTime={formatTime}
          homeScore={homeScore}
          awayScore={awayScore}
          selectedFixtureData={selectedFixtureData}
        />
      </TabsContent>

      <TabsContent value="cards">
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

      <TabsContent value="time">
        <EnhancedTimeTab
          allPlayers={allPlayers}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          trackedPlayers={trackedPlayers}
          selectedPlayer={selectedTimePlayer}
          selectedTimeTeam={selectedTimeTeam}
          matchTime={matchTime}
          isTimerRunning={isRunning}
          onPlayerSelect={setSelectedTimePlayer}
          onTimeTeamChange={setSelectedTimeTeam}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onTogglePlayerTime={onTogglePlayerTime}
          formatTime={formatTime}
        />
      </TabsContent>

      <TabsContent value="summary">
        <SummaryTab
          selectedFixtureData={selectedFixtureData}
          homeScore={homeScore}
          awayScore={awayScore}
          matchTime={matchTime}
          goals={goals}
          cards={cards}
          trackedPlayers={trackedPlayers}
          events={events}
          allPlayers={allPlayers}
          onExportSummary={onExportSummary}
          formatTime={formatTime}
        />
      </TabsContent>
    </>
  );
};

export default RefereeTabsContent;
