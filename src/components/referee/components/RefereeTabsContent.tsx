import { TabsContent } from "@/components/ui/tabs";
import { ComponentPlayer } from "../hooks/useRefereeState";
import ScoreTab from "./tabs/ScoreTab";
import RoleBasedUnifiedTimerTab from "./tabs/RoleBasedUnifiedTimerTab";
import GoalsTab from "./tabs/GoalsTab";
import CardsTab from "./tabs/CardsTab";
import CoordinationTab from "./tabs/CoordinationTab";
import SummaryTab from "./tabs/SummaryTab";
import SaveNowButton from "./shared/SaveNowButton";
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Score Management</h3>
          <SaveNowButton onSave={props.onSaveMatch} />
        </div>
        <ScoreTab
          selectedFixtureData={props.selectedFixtureData}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          matchTime={props.matchTime}
          isRunning={props.isRunning}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          formatTime={props.formatTime}
          onToggleTimer={props.onToggleTimer}
          onResetMatch={props.onResetMatch}
          onSaveMatch={props.onSaveMatch}
          onAssignGoal={props.onAssignGoal}
        />
      </TabsContent>

      <TabsContent value="timer-tracking" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Time Tracking</h3>
          <SaveNowButton onSave={props.onSaveMatch} />
        </div>
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Goals Management</h3>
          <SaveNowButton onSave={props.onSaveMatch} />
        </div>
        <GoalsTab
          selectedFixtureData={props.selectedFixtureData}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          matchTime={props.matchTime}
          formatTime={props.formatTime}
          onGoalAssigned={props.onAssignGoal}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          showGoalWizard={false}
          onCancelGoalWizard={() => {}}
        />
      </TabsContent>

      <TabsContent value="cards" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Cards Management</h3>
          <SaveNowButton onSave={props.onSaveMatch} />
        </div>
        <CardsTab
          selectedFixtureData={props.selectedFixtureData}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          cards={props.cards}
          selectedPlayer={props.selectedPlayer}
          selectedTeam={props.selectedTeam}
          selectedCardType={props.selectedCardType}
          onPlayerSelect={props.setSelectedPlayer}
          onTeamChange={props.setSelectedTeam}
          onCardTypeChange={props.setSelectedCardType}
          formatTime={props.formatTime}
          matchTime={props.matchTime}
        />
      </TabsContent>

      <TabsContent value="coordination" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Match Coordination</h3>
          <SaveNowButton onSave={props.onSaveMatch} />
        </div>
        <CoordinationTab
          selectedFixtureData={props.selectedFixtureData}
          workflowConfig={props.workflowConfig}
        />
      </TabsContent>

      <TabsContent value="summary" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Match Summary</h3>
          <div className="flex gap-2">
            <SaveNowButton onSave={props.onSaveMatch} />
            <SaveNowButton 
              onSave={props.onExportSummary} 
              variant="outline"
            >
              Export
            </SaveNowButton>
          </div>
        </div>
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
          formatTime={props.formatTime}
          onExportSummary={props.onExportSummary}
        />
      </TabsContent>
    </>
  );
};

export default RefereeTabsContent;
