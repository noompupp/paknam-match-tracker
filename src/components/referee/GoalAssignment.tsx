
import { Card, CardContent } from "@/components/ui/card";
import GoalAssignmentHeader from "./components/GoalAssignmentHeader";
import LiveScoreDisplay from "./components/LiveScoreDisplay";
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
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
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
  matchTime,
  onPlayerSelect,
  onGoalTypeChange,
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
        <LiveScoreDisplay
          homeTeamName={selectedFixtureData?.home_team?.name}
          awayTeamName={selectedFixtureData?.away_team?.name}
          homeScore={homeScore}
          awayScore={awayScore}
          homeTeamGoals={homeTeamGoals}
          awayTeamGoals={awayTeamGoals}
          totalAssists={totalAssists}
        />

        <GoalAssignmentForm
          allPlayers={allPlayers}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          selectedPlayer={selectedPlayer}
          selectedGoalType={selectedGoalType}
          onPlayerSelect={onPlayerSelect}
          onGoalTypeChange={onGoalTypeChange}
        />

        <GoalAssignmentButton
          selectedPlayer={selectedPlayer}
          selectedGoalType={selectedGoalType}
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
