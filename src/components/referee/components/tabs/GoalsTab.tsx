
import { useState } from "react";
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
  const [wizardInitialTeam, setWizardInitialTeam] = useState<'home' | 'away' | undefined>(undefined);

  const handleQuickGoal = (team: 'home' | 'away') => {
    setWizardInitialTeam(team);
    setShowWizard(true);
  };

  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
  }) => {
    console.log('Goal assigned via wizard:', goalData);
    
    // Call the goal assignment for the main goal
    props.onAssignGoal(goalData.player);
    
    // If there's an assist player, assign the assist separately
    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      // Set the goal type to assist and assign it
      props.onGoalTypeChange('assist');
      setTimeout(() => {
        props.onAssignGoal(goalData.assistPlayer!);
        // Reset back to goal type
        props.onGoalTypeChange('goal');
      }, 100);
    }
    
    setShowWizard(false);
    setWizardInitialTeam(undefined);
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
          onCancel={() => {
            setShowWizard(false);
            setWizardInitialTeam(undefined);
          }}
          initialTeam={wizardInitialTeam}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Simplified Goal Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Entry</CardTitle>
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

      {/* Goal Summary */}
      {props.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Goals & Assists ({props.goals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {props.goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <span className="font-medium">{goal.playerName}</span>
                    <span className="text-muted-foreground ml-2">({goal.team})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize">{goal.type}</div>
                    <div className="text-xs text-muted-foreground">{props.formatTime(goal.time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsTab;
