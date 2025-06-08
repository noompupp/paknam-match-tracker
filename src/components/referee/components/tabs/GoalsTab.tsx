import { useState } from "react";
import GoalAssignment from "../../GoalAssignment";
import GoalEntryWizard from "../GoalEntryWizard";
import QuickGoalEntry from "../QuickGoalEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentPlayer } from "../../hooks/useRefereeState";

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
}

const GoalsTab = (props: GoalsTabProps) => {
  const [showWizard, setShowWizard] = useState(false);
  const [goalEntryMode, setGoalEntryMode] = useState<'quick' | 'detailed' | 'wizard'>('quick');

  const handleQuickGoal = (team: 'home' | 'away') => {
    // For quick goals, we'll add the goal immediately but mark it as needing player assignment
    console.log(`Quick goal added for ${team} team - needs player assignment`);
    // This would trigger the existing goal assignment flow
  };

  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
  }) => {
    console.log('Goal assigned via wizard:', goalData);
    props.onAssignGoal(goalData.player);
    setShowWizard(false);
  };

  const homeTeamName = props.selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = props.selectedFixtureData?.away_team?.name || 'Away Team';

  if (showWizard) {
    return (
      <div className="space-y-6">
        <GoalEntryWizard
          selectedFixtureData={props.selectedFixtureData}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          matchTime={props.matchTime}
          formatTime={props.formatTime}
          onGoalAssigned={handleWizardGoalAssigned}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Goal Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Entry Options</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickGoalEntry
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            onAddGoal={handleQuickGoal}
            onOpenWizard={() => setShowWizard(true)}
          />
        </CardContent>
      </Card>

      {/* Existing Goal Assignment Component */}
      <GoalAssignment
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
        onAssignGoal={() => {
          if (!props.selectedPlayer || !props.selectedGoalTeam) return;
          
          const filteredPlayers = props.selectedGoalTeam === 'home' 
            ? props.homeTeamPlayers || []
            : props.awayTeamPlayers || [];
          
          const player = filteredPlayers.find(p => p.id.toString() === props.selectedPlayer);
          if (player) {
            props.onAssignGoal(player);
          }
        }}
        formatTime={props.formatTime}
        homeScore={props.homeScore}
        awayScore={props.awayScore}
        selectedFixtureData={props.selectedFixtureData}
      />
    </div>
  );
};

export default GoalsTab;
