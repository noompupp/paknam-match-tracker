// Remove workflowConfig and CoordinationTab
import { TabsContent } from "@/components/ui/tabs";
import { ComponentPlayer } from "../hooks/useRefereeState";
import ScoreTab from "./tabs/ScoreTab";
import RoleBasedUnifiedTimerTab from "./tabs/RoleBasedUnifiedTimerTab";
// Removed import of GoalsTab
import CardsTab from "./tabs/CardsTab";
// Removed import CoordinationTab
import SummaryTab from "./tabs/SummaryTab";
import SaveNowButton from "./shared/SaveNowButton";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

// Import EnhancedCardsTab and UnifiedMatchTimer
import EnhancedCardsTab from "./tabs/EnhancedCardsTab";
import UnifiedMatchTimer from "./UnifiedMatchTimer";
import { useTranslation } from "@/hooks/useTranslation";

// Remove workflowConfig from props type
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
  // Removed: workflowConfig: WorkflowModeConfig;
}

const RefereeTabsContent = (props: RefereeTabsContentProps) => {
  const { t } = useTranslation();

  return (
    <>
      <TabsContent value="score" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('referee.scoreManagement')}</h3>
          <SaveNowButton onSave={props.onSaveMatch}>
            {t('referee.save')}
          </SaveNowButton>
        </div>
        <ScoreTab
          selectedFixtureData={props.selectedFixtureData}
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
          <h3 className="text-lg font-semibold">{t('referee.timeTracking')}</h3>
          <SaveNowButton onSave={props.onSaveMatch}>
            {t('referee.save')}
          </SaveNowButton>
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

      {/* Removed Goals Tab */}

      <TabsContent value="cards" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('referee.cardsManagement')}</h3>
          <SaveNowButton onSave={props.onSaveMatch}>
            {t('referee.save')}
          </SaveNowButton>
        </div>
        <EnhancedCardsTab
          selectedFixtureData={props.selectedFixtureData}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          cards={props.cards}
          selectedPlayer={props.selectedPlayer}
          selectedTeam={props.selectedTeam}
          selectedCardType={props.selectedCardType}
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

      {/* Removed Coordination Tab */}

      <TabsContent value="summary" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('referee.matchSummary')}</h3>
          <div className="flex gap-2">
            <SaveNowButton onSave={props.onSaveMatch}>
              {t('referee.save')}
            </SaveNowButton>
            <SaveNowButton 
              onSave={props.onExportSummary} 
              variant="outline"
            >
              {t('referee.export')}
            </SaveNowButton>
          </div>
        </div>
        {/* UnifiedMatchTimer for quick timer controls in summary */}
        <UnifiedMatchTimer
          selectedFixtureData={props.selectedFixtureData}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          matchTime={props.matchTime}
          isRunning={props.isRunning}
          formatTime={props.formatTime}
          onToggleTimer={props.onToggleTimer}
          onResetMatch={props.onResetMatch}
        />
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
