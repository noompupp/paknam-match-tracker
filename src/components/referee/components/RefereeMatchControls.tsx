
import MatchTimer from "../MatchTimer";
import ScoreManagement from "../ScoreManagement";
import GoalAssignment from "../GoalAssignment";
import CardManagementDropdown from "../CardManagementDropdown";
import PlayerTimeTracker from "../PlayerTimeTracker";
import StatsManagement from "../StatsManagement";
import MatchSummary from "../MatchSummary";
import MatchEvents from "../MatchEvents";
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
  onAddCard: (playerName: string, team: string, cardType: "yellow" | "red", time: number) => void;
  onAddPlayer: (player: ComponentPlayer) => void;
  onRemovePlayer: (playerId: number) => void;
  onTogglePlayerTime: (playerId: number) => void;
  onExportSummary: () => void;
}

const RefereeMatchControls = (props: RefereeMatchControlsProps) => {
  return (
    <>
      <MatchTimer
        selectedFixtureData={props.selectedFixtureData}
        homeScore={props.homeScore}
        awayScore={props.awayScore}
        matchTime={props.matchTime}
        isRunning={props.isRunning}
        formatTime={props.formatTime}
      />

      <ScoreManagement
        selectedFixtureData={props.selectedFixtureData}
        homeScore={props.homeScore}
        awayScore={props.awayScore}
        isRunning={props.isRunning}
        isPending={props.updateFixtureScore.isPending}
        onAddGoal={props.onAddGoal}
        onRemoveGoal={props.onRemoveGoal}
        onToggleTimer={props.onToggleTimer}
        onResetMatch={props.onResetMatch}
        onSaveMatch={props.onSaveMatch}
      />

      <GoalAssignment
        allPlayers={props.allPlayers}
        goals={props.goals}
        selectedPlayer={props.selectedGoalPlayer}
        selectedGoalType={props.selectedGoalType}
        matchTime={props.matchTime}
        onPlayerSelect={props.setSelectedGoalPlayer}
        onGoalTypeChange={props.setSelectedGoalType}
        onAssignGoal={() => {
          if (props.selectedGoalPlayer) {
            const player = props.allPlayers.find(p => p.id.toString() === props.selectedGoalPlayer);
            if (player) {
              props.onAssignGoal(player);
            }
          }
        }}
        formatTime={props.formatTime}
      />

      <CardManagementDropdown
        selectedFixtureData={props.selectedFixtureData}
        allPlayers={props.allPlayers}
        selectedPlayer={props.selectedPlayer}
        selectedTeam={props.selectedTeam}
        selectedCardType={props.selectedCardType}
        cards={props.cards}
        onPlayerSelect={props.setSelectedPlayer}
        onTeamChange={props.setSelectedTeam}
        onCardTypeChange={props.setSelectedCardType}
        onAddCard={() => props.selectedPlayer && props.selectedTeam && props.selectedCardType && props.onAddCard(props.selectedPlayer, props.selectedTeam, props.selectedCardType, props.matchTime)}
        formatTime={props.formatTime}
      />

      <PlayerTimeTracker
        trackedPlayers={props.trackedPlayers}
        selectedPlayer={props.selectedTimePlayer}
        allPlayers={props.playersForTimeTracker}
        onPlayerSelect={props.setSelectedTimePlayer}
        onAddPlayer={() => {
          if (props.selectedTimePlayer) {
            const player = props.playersForTimeTracker.find(p => p.id.toString() === props.selectedTimePlayer);
            if (player) {
              props.onAddPlayer(player);
            }
          }
        }}
        onRemovePlayer={props.onRemovePlayer}
        onTogglePlayerTime={props.onTogglePlayerTime}
        formatTime={props.formatTime}
        matchTime={props.matchTime}
      />

      <StatsManagement />

      <MatchSummary
        selectedFixtureData={props.selectedFixtureData}
        homeScore={props.homeScore}
        awayScore={props.awayScore}
        matchTime={props.matchTime}
        events={props.events}
        goals={props.goals}
        cards={props.cards}
        trackedPlayers={props.trackedPlayers}
        allPlayers={props.allPlayers}
        onExportSummary={props.onExportSummary}
        formatTime={props.formatTime}
      />

      <MatchEvents
        events={props.events}
        formatTime={props.formatTime}
      />
    </>
  );
};

export default RefereeMatchControls;
