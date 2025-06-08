
import RefereeMatchControlSection from "./RefereeMatchControlSection";
import RefereeToolsMain from "./RefereeToolsMain";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface RefereeMainContentProps {
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
  saveAttempts: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  addPlayer: (player: ComponentPlayer) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
}

const RefereeMainContent = (props: RefereeMainContentProps) => {
  return (
    <div className="space-y-4">
      {/* Enhanced save controls with proper database integration */}
      <RefereeMatchControlSection
        selectedFixtureData={props.selectedFixtureData}
        saveAttempts={props.saveAttempts}
        onSaveMatch={props.onSaveMatch}
        onResetMatch={props.onResetMatch}
      />

      <RefereeToolsMain
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
        cards={props.cards}
        selectedPlayer={props.selectedPlayer}
        selectedTeam={props.selectedTeam}
        selectedCardType={props.selectedCardType}
        setSelectedPlayer={props.setSelectedPlayer}
        setSelectedTeam={props.setSelectedTeam}
        setSelectedCardType={props.setSelectedCardType}
        trackedPlayers={props.trackedPlayers}
        selectedTimePlayer={props.selectedTimePlayer}
        selectedTimeTeam={props.selectedTimeTeam}
        setSelectedTimePlayer={props.setSelectedTimePlayer}
        setSelectedTimeTeam={props.setSelectedTimeTeam}
        events={props.events}
        toggleTimer={props.toggleTimer}
        resetTimer={props.resetTimer}
        assignGoal={props.assignGoal}
        addPlayer={props.addPlayer}
        removePlayer={props.removePlayer}
        togglePlayerTime={props.togglePlayerTime}
      />
    </div>
  );
};

export default RefereeMainContent;
