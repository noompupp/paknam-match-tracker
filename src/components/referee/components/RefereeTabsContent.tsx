
import { TabsContent } from "@/components/ui/tabs";
import ScoreTab from "./tabs/ScoreTab";
import GoalsTab from "./tabs/GoalsTab";
import EnhancedCardsTab from "./tabs/EnhancedCardsTab";
import PlayerTimeTab from "./tabs/PlayerTimeTab";
import CoordinationTab from "./tabs/CoordinationTab";
import SummaryTab from "./tabs/SummaryTab";
import UnifiedTimerTab from "./tabs/UnifiedTimerTab";
import { ComponentPlayer } from "../hooks/useRefereeState";
import { WorkflowModeConfig } from "../workflows/types";

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
  onQuickGoal: (team: 'home' | 'away') => void;
  onOpenGoalWizard: () => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  onAddCard: (playerName: string, team: string, cardType: 'yellow' | 'red', time: number) => void;
  onAddPlayer: (player: ComponentPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  onExportSummary: () => void;
  workflowConfig: WorkflowModeConfig;
}

const RefereeTabsContent = (props: RefereeTabsContentProps) => {
  return (
    <>
      <TabsContent value="score" className="mt-4">
        <ScoreTab
          selectedFixtureData={props.selectedFixtureData}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          matchTime={props.matchTime}
          isRunning={props.isRunning}
          formatTime={props.formatTime}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          onToggleTimer={props.onToggleTimer}
          onResetMatch={props.onResetMatch}
          onSaveMatch={props.onSaveMatch}
          onAssignGoal={props.onAssignGoal}
        />
      </TabsContent>

      <TabsContent value="goals" className="mt-4">
        <GoalsTab
          selectedFixtureData={props.selectedFixtureData}
          goals={props.goals}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          selectedPlayer={props.selectedGoalPlayer}
          selectedGoalType={props.selectedGoalType}
          selectedGoalTeam={props.selectedGoalTeam}
          onPlayerSelect={props.setSelectedGoalPlayer}
          onGoalTypeChange={props.setSelectedGoalType}
          onGoalTeamChange={props.setSelectedGoalTeam}
          matchTime={props.matchTime}
          formatTime={props.formatTime}
          assignGoal={props.onAssignGoal}
        />
      </TabsContent>

      <TabsContent value="cards" className="mt-4">
        <EnhancedCardsTab
          selectedFixtureData={props.selectedFixtureData}
          cards={props.cards}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          selectedPlayer={props.selectedPlayer}
          selectedTeam={props.selectedTeam}
          selectedCardType={props.selectedCardType}
          setSelectedPlayer={props.setSelectedPlayer}
          setSelectedTeam={props.setSelectedTeam}
          setSelectedCardType={props.setSelectedCardType}
          matchTime={props.matchTime}
          onPlayerSelect={props.setSelectedPlayer}
          onTeamChange={props.setSelectedTeam}
          onCardTypeChange={props.setSelectedCardType}
          formatTime={props.formatTime}
          onToggleTimer={props.onToggleTimer}
          onResetMatch={props.onResetMatch}
          isRunning={props.isRunning}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
        />
      </TabsContent>

      <TabsContent value="time" className="mt-4">
        <PlayerTimeTab
          trackedPlayers={props.trackedPlayers}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          selectedTimePlayer={props.selectedTimePlayer}
          selectedTimeTeam={props.selectedTimeTeam}
          setSelectedTimePlayer={props.setSelectedTimePlayer}
          setSelectedTimeTeam={props.setSelectedTimeTeam}
          matchTime={props.matchTime}
          addPlayer={props.onAddPlayer}
          removePlayer={props.onRemovePlayer}
          togglePlayerTime={props.onTogglePlayerTime}
          formatTime={props.formatTime}
        />
      </TabsContent>

      <TabsContent value="timer" className="mt-4">
        <UnifiedTimerTab
          selectedFixtureData={props.selectedFixtureData}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          matchTime={props.matchTime}
          isRunning={props.isRunning}
          formatTime={props.formatTime}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          trackedPlayers={props.trackedPlayers}
          onToggleTimer={props.onToggleTimer}
          onResetMatch={props.onResetMatch}
          onAddPlayer={props.onAddPlayer}
          onRemovePlayer={props.onRemovePlayer}
          onTogglePlayerTime={props.onTogglePlayerTime}
        />
      </TabsContent>

      <TabsContent value="coordination" className="mt-4">
        <CoordinationTab
          selectedFixtureData={props.selectedFixtureData}
          workflowConfig={props.workflowConfig}
        />
      </TabsContent>

      <TabsContent value="summary" className="mt-4">
        <SummaryTab
          selectedFixtureData={props.selectedFixtureData}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          matchTime={props.matchTime}
          goals={props.goals}
          cards={props.cards}
          trackedPlayers={props.trackedPlayers}
          events={props.events}
          allPlayers={props.allPlayers}
          onExportSummary={props.onExportSummary}
          formatTime={props.formatTime}
        />
      </TabsContent>
    </>
  );
};

export default RefereeTabsContent;
