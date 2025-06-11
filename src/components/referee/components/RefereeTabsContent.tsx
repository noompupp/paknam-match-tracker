
import { TabsContent } from "@/components/ui/tabs";
import { ComponentPlayer } from "../hooks/useRefereeState";
import ScoreTab from "./tabs/ScoreTab";
import RoleBasedUnifiedTimerTab from "./tabs/RoleBasedUnifiedTimerTab";
import GoalsTab from "./tabs/GoalsTab";
import CardsTab from "./tabs/CardsTab";
import CoordinationTab from "./tabs/CoordinationTab";
import SummaryTab from "./tabs/SummaryTab";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
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
  onAddPlayer: (player: ProcessedPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  onExportSummary: () => void;
  workflowConfig: WorkflowModeConfig;
}

const RefereeTabsContent = (props: RefereeTabsContentProps) => {
  return (
    <>
      <TabsContent value="score" className="space-y-6">
        <ScoreTab
          selectedFixtureData={props.selectedFixtureData}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          matchTime={props.matchTime}
          isRunning={props.isRunning}
          formatTime={props.formatTime}
          onAddGoal={props.onAddGoal}
          onRemoveGoal={props.onRemoveGoal}
          onQuickGoal={props.onQuickGoal}
          onOpenGoalWizard={props.onOpenGoalWizard}
          onSaveMatch={props.onSaveMatch}
          onResetMatch={props.onResetMatch}
        />
      </TabsContent>

      <TabsContent value="timer-tracking" className="space-y-6">
        <RoleBasedUnifiedTimerTab
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

      <TabsContent value="goals" className="space-y-6">
        <GoalsTab
          selectedFixtureData={props.selectedFixtureData}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          goals={props.goals}
          selectedGoalPlayer={props.selectedGoalPlayer}
          selectedGoalType={props.selectedGoalType}
          selectedGoalTeam={props.selectedGoalTeam}
          setSelectedGoalPlayer={props.setSelectedGoalPlayer}
          setSelectedGoalType={props.setSelectedGoalType}
          setSelectedGoalTeam={props.setSelectedGoalTeam}
          onAssignGoal={props.onAssignGoal}
          formatTime={props.formatTime}
          matchTime={props.matchTime}
        />
      </TabsContent>

      <TabsContent value="cards" className="space-y-6">
        <CardsTab
          selectedFixtureData={props.selectedFixtureData}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          cards={props.cards}
          selectedPlayer={props.selectedPlayer}
          selectedTeam={props.selectedTeam}
          selectedCardType={props.selectedCardType}
          setSelectedPlayer={props.setSelectedPlayer}
          setSelectedTeam={props.setSelectedTeam}
          setSelectedCardType={props.setSelectedCardType}
          onAddCard={props.onAddCard}
          formatTime={props.formatTime}
          matchTime={props.matchTime}
        />
      </TabsContent>

      <TabsContent value="coordination" className="space-y-6">
        <CoordinationTab
          selectedFixtureData={props.selectedFixtureData}
          workflowConfig={props.workflowConfig}
        />
      </TabsContent>

      <TabsContent value="summary" className="space-y-6">
        <SummaryTab
          selectedFixtureData={props.selectedFixtureData}
          goals={props.goals}
          cards={props.cards}
          trackedPlayers={props.trackedPlayers}
          events={props.events}
          formatTime={props.formatTime}
          onExportSummary={props.onExportSummary}
        />
      </TabsContent>
    </>
  );
};

export default RefereeTabsContent;
