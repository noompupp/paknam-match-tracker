
import { Tabs } from "@/components/ui/tabs";
import RefereeMatchHeader from "./RefereeMatchHeader";
import RefereeTabsNavigation from "./RefereeTabsNavigation";
import RefereeTabsContent from "./RefereeTabsContent";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface RefereeMatchControlsContainerProps {
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

const RefereeMatchControlsContainer = (props: RefereeMatchControlsContainerProps) => {
  return (
    <div className="space-y-6">
      {/* Match Header */}
      <RefereeMatchHeader selectedFixtureData={props.selectedFixtureData} />

      {/* Main Control Tabs */}
      <Tabs defaultValue="score" className="space-y-4">
        <RefereeTabsNavigation />
        <RefereeTabsContent {...props} />
      </Tabs>
    </div>
  );
};

export default RefereeMatchControlsContainer;
