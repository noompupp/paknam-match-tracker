import { Card, CardContent } from "@/components/ui/card";
import GoalAssignmentHeader from "./components/GoalAssignmentHeader";
import GoalAssignmentForm from "./components/GoalAssignmentForm";
import GoalAssignmentButton from "./components/GoalAssignmentButton";
import AssignedGoalsList from "./components/AssignedGoalsList";
import NoGoalsPlaceholder from "./components/NoGoalsPlaceholder";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface GoalData {
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  type: 'goal' | 'assist';
}

interface GoalAssignmentProps {
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  goals: GoalData[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onGoalTeamChange: (value: string) => void;
  onAssignGoal: () => void;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
}

const GoalAssignment = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  goals,
  selectedPlayer,
  selectedGoalType,
  selectedGoalTeam,
  matchTime,
  onPlayerSelect,
  onGoalTypeChange,
  onGoalTeamChange,
  onAssignGoal,
  formatTime,
  homeScore,
  awayScore,
  selectedFixtureData
}: GoalAssignmentProps) => {
  const homeTeamGoals = goals.filter(goal => 
    goal.type === 'goal' && goal.team === selectedFixtureData?.home_team?.name
  ).length;
  
  const awayTeamGoals = goals.filter(goal => 
    goal.type === 'goal' && goal.team === selectedFixtureData?.away_team?.name
  ).length;

  const totalAssists = goals.filter(goal => goal.type === 'assist').length;

  return (
    <Card className="card-shadow-lg">
      <GoalAssignmentHeader />
      <CardContent className="space-y-6">
        <GoalAssignmentForm
          allPlayers={allPlayers}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          selectedPlayer={selectedPlayer}
          selectedGoalType={selectedGoalType}
          selectedGoalTeam={selectedGoalTeam}
          onPlayerSelect={onPlayerSelect}
          onGoalTypeChange={onGoalTypeChange}
          onGoalTeamChange={onGoalTeamChange}
          selectedFixtureData={selectedFixtureData}
        />

        <GoalAssignmentButton
          selectedPlayer={selectedPlayer}
          selectedGoalType={selectedGoalType}
          selectedGoalTeam={selectedGoalTeam}
          matchTime={matchTime}
          formatTime={formatTime}
          onAssignGoal={onAssignGoal}
        />

        {goals.length > 0 ? (
          <AssignedGoalsList
            goals={goals}
            formatTime={formatTime}
          />
        ) : (
          <NoGoalsPlaceholder />
        )}
      </CardContent>
    </Card>
  );
};

export default GoalAssignment;
