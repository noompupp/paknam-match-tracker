
import RefereeMatchControlsContainer from "./RefereeMatchControlsContainer";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface RefereeMatchControlsProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  playersForTimeTracker: any[];
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

const RefereeMatchControls = (props: RefereeMatchControlsProps) => {
  return (
    <RefereeMatchControlsContainer 
      selectedFixtureData={props.selectedFixtureData}
      homeScore={props.homeScore}
      awayScore={props.awayScore}
      matchTime={props.matchTime}
      isRunning={props.isRunning}
      formatTime={props.formatTime}
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
      selectedPlayer={props.selectedPlayer}
      selectedTeam={props.selectedTeam}
      selectedCardType={props.selectedCardType}
      setSelectedPlayer={props.setSelectedPlayer}
      setSelectedTeam={props.setSelectedTeam}
      setSelectedCardType={props.setSelectedCardType}
      cards={props.cards}
      trackedPlayers={props.trackedPlayers}
      selectedTimePlayer={props.selectedTimePlayer}
      selectedTimeTeam={props.selectedTimeTeam}
      setSelectedTimePlayer={props.setSelectedTimePlayer}
      setSelectedTimeTeam={props.setSelectedTimeTeam}
      events={props.events}
      onAddGoal={props.onAddGoal}
      onRemoveGoal={props.onRemoveGoal}
      onToggleTimer={props.onToggleTimer}
      onResetMatch={props.onResetMatch}
      onSaveMatch={props.onSaveMatch}
      onAssignGoal={props.onAssignGoal}
      onAddCard={props.onAddCard}
      onAddPlayer={props.onAddPlayer}
      onRemovePlayer={props.onRemovePlayer}
      onTogglePlayerTime={props.onTogglePlayerTime}
      onExportSummary={props.onExportSummary}
    />
  );
};

export default RefereeMatchControls;
