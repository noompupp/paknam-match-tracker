
import { ComponentPlayer } from "../../hooks/useRefereeState";
import GoalsTabContainer from "./components/GoalsTabContainer";

interface GoalsTabProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  goals: any[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  matchTime: number;
  selectedFixtureData: any;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onGoalTeamChange: (value: string) => void;
  formatTime: (seconds: number) => string;
  assignGoal: (player: any, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
}

const GoalsTab = (props: GoalsTabProps) => {
  // We need to add missing props that GoalsTabContainer expects
  const handleAssignGoal = (player: ComponentPlayer) => {
    if (!props.selectedFixtureData) return;
    
    const homeTeam = {
      id: props.selectedFixtureData.home_team?.__id__ || props.selectedFixtureData.home_team_id,
      name: props.selectedFixtureData.home_team?.name || 'Home Team'
    };
    
    const awayTeam = {
      id: props.selectedFixtureData.away_team?.__id__ || props.selectedFixtureData.away_team_id,
      name: props.selectedFixtureData.away_team?.name || 'Away Team'
    };
    
    props.assignGoal(player, props.matchTime, props.selectedFixtureData.id, homeTeam, awayTeam);
  };

  // Calculate scores from goals
  const homeScore = props.goals.filter(g => g.team === 'home' && g.type === 'goal').length;
  const awayScore = props.goals.filter(g => g.team === 'away' && g.type === 'goal').length;

  return (
    <GoalsTabContainer
      allPlayers={props.allPlayers}
      homeTeamPlayers={props.homeTeamPlayers}
      awayTeamPlayers={props.awayTeamPlayers}
      goals={props.goals}
      selectedPlayer={props.selectedPlayer}
      selectedGoalType={props.selectedGoalType}
      selectedGoalTeam={props.selectedGoalTeam}
      matchTime={props.matchTime}
      onPlayerSelect={props.onPlayerSelect}
      onGoalTypeChange={props.onGoalTypeChange}
      onGoalTeamChange={props.onGoalTeamChange}
      onAssignGoal={handleAssignGoal}
      formatTime={props.formatTime}
      homeScore={homeScore}
      awayScore={awayScore}
      selectedFixtureData={props.selectedFixtureData}
    />
  );
};

export default GoalsTab;
