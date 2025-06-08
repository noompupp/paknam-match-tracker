
import { ComponentPlayer } from "../../hooks/useRefereeState";
import GoalsTabContainer from "./components/GoalsTabContainer";
import GoalsTabWizardHandler from "./components/GoalsTabWizardHandler";

interface GoalsTabProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  goals: any[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onGoalTeamChange: (value: string) => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
  forceRefresh?: () => Promise<void>;
}

const GoalsTab = (props: GoalsTabProps) => {
  return <GoalsTabContainer {...props} />;
};

export default GoalsTab;
