
import { useState } from "react";
import GoalEntryWizard from "../GoalEntryWizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { Zap, Target, Edit, Trophy, Clock, AlertCircle } from "lucide-react";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";

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
  const [wizardMode, setWizardMode] = useState<'quick' | 'detailed' | 'assign'>('quick');
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);
  const { toast } = useToast();

  const homeTeamName = props.selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = props.selectedFixtureData?.away_team?.name || 'Away Team';

  // Enhanced quick goal handler with improved feedback
  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!props.selectedFixtureData || isProcessingQuickGoal) return;

    setIsProcessingQuickGoal(true);

    try {
      console.log('⚡ GoalsTab: Adding quick goal for team:', team);
      
      const homeTeamId = props.selectedFixtureData.home_team?.__id__ || props.selectedFixtureData.home_team_id;
      const awayTeamId = props.selectedFixtureData.away_team?.__id__ || props.selectedFixtureData.away_team_id;

      const result = await quickGoalService.addQuickGoal({
        fixtureId: props.selectedFixtureData.id,
        team,
        matchTime: props.matchTime,
        homeTeam: {
          id: homeTeamId,
          name: props.selectedFixtureData.home_team?.name,
          __id__: homeTeamId
        },
        awayTeam: {
          id: awayTeamId,
          name: props.selectedFixtureData.away_team?.name,
          __id__: awayTeamId
        }
      });

      if (result.success) {
        toast({
          title: "⚡ Quick Goal Added!",
          description: `Goal recorded for ${team === 'home' ? homeTeamName : awayTeamName} at ${props.formatTime(props.matchTime)}. Score updated automatically.`,
        });
      } else {
        toast({
          title: "Quick Goal Failed",
          description: result.error || 'Failed to add quick goal',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ GoalsTab: Error adding quick goal:', error);
      toast({
        title: "Quick Goal Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessingQuickGoal(false);
    }
  };

  // Goal with details handler
  const handleGoalWithDetails = (team?: 'home' | 'away') => {
    setWizardInitialTeam(team);
    setWizardMode('detailed');
    setShowWizard(true);
  };

  // Add details to existing goals handler
  const handleAddDetailsToGoals = () => {
    setWizardMode('assign');
    setShowWizard(true);
  };

  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
  }) => {
    console.log('🎯 GoalsTab: Goal assigned via wizard:', goalData);
    props.onAssignGoal(goalData.player);
    
    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      setTimeout(() => {
        props.onAssignGoal(goalData.assistPlayer!);
      }, 100);
    }
    
    setShowWizard(false);
    setWizardInitialTeam(undefined);
  };

  // Get unassigned goals (Quick Goals that need details)
  const unassignedGoals = props.goals.filter(goal => 
    goal.playerName === 'Quick Goal' || goal.playerName === 'Unknown Player'
  );

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
      {/* Current Score Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h3 className="text-sm font-medium text-muted-foreground">{homeTeamName}</h3>
              <div className="text-3xl font-bold text-primary">{props.homeScore}</div>
            </div>
            
            <div className="text-center px-4">
              <div className="text-lg font-bold text-muted-foreground">VS</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{props.formatTime(props.matchTime)}</span>
              </div>
            </div>
            
            <div className="text-center flex-1">
              <h3 className="text-sm font-medium text-muted-foreground">{awayTeamName}</h3>
              <div className="text-3xl font-bold text-primary">{props.awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three-Button Goal Recording Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Recording Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 1. Quick Goal - Instant recording for live matches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">1</span>
              <h4 className="text-sm font-medium">Quick Goal - Instant Recording</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Perfect for live matches - instantly updates the score and records the goal. Add player details later.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleQuickGoal('home')}
                disabled={isProcessingQuickGoal}
                variant="outline"
                className="h-16 text-base flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 border-2 border-green-200"
              >
                <Zap className="h-5 w-5 text-green-600" />
                <div className="text-center">
                  <div className="font-medium">{isProcessingQuickGoal ? 'Adding...' : 'Quick Goal'}</div>
                  <div className="text-xs text-muted-foreground">{homeTeamName}</div>
                </div>
              </Button>
              <Button
                onClick={() => handleQuickGoal('away')}
                disabled={isProcessingQuickGoal}
                variant="outline"
                className="h-16 text-base flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 border-2 border-green-200"
              >
                <Zap className="h-5 w-5 text-green-600" />
                <div className="text-center">
                  <div className="font-medium">{isProcessingQuickGoal ? 'Adding...' : 'Quick Goal'}</div>
                  <div className="text-xs text-muted-foreground">{awayTeamName}</div>
                </div>
              </Button>
            </div>
          </div>

          {/* 2. Goal with Details - Complete recording */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">2</span>
              <h4 className="text-sm font-medium">Goal with Details - Complete Recording</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Record a goal with full details including player name, assists, and match context in one step.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleGoalWithDetails('home')}
                variant="outline"
                className="h-14 flex flex-col items-center gap-1 hover:bg-blue-50 hover:border-blue-300 border-2 border-blue-200"
              >
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-center">
                  <div className="text-sm font-medium">Goal with Details</div>
                  <div className="text-xs text-muted-foreground">{homeTeamName}</div>
                </div>
              </Button>
              <Button
                onClick={() => handleGoalWithDetails('away')}
                variant="outline"
                className="h-14 flex flex-col items-center gap-1 hover:bg-blue-50 hover:border-blue-300 border-2 border-blue-200"
              >
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-center">
                  <div className="text-sm font-medium">Goal with Details</div>
                  <div className="text-xs text-muted-foreground">{awayTeamName}</div>
                </div>
              </Button>
            </div>
            <Button
              onClick={() => handleGoalWithDetails()}
              className="w-full h-12"
              variant="default"
            >
              <Target className="h-4 w-4 mr-2" />
              Open Full Goal Entry Wizard
            </Button>
          </div>

          {/* 3. Add Details to Earlier Goals - Only show if there are unassigned goals */}
          {unassignedGoals.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">3</span>
                <h4 className="text-sm font-medium">Add Details to Earlier Goals</h4>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-orange-800 mb-2">
                      {unassignedGoals.length} goal{unassignedGoals.length !== 1 ? 's' : ''} need player details
                    </div>
                    <p className="text-xs text-orange-700 mb-3">
                      These goals were recorded quickly during the match. Add player names and assists now.
                    </p>
                    <Button
                      onClick={handleAddDetailsToGoals}
                      variant="outline"
                      className="w-full hover:bg-orange-100 hover:border-orange-300 border-orange-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Add Player Details to {unassignedGoals.length} Goal{unassignedGoals.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals Summary */}
      {props.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Match Goals & Assists ({props.goals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {props.goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      goal.playerName === 'Quick Goal' ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <span className="font-medium">
                        {goal.playerName === 'Quick Goal' ? '⚡ Quick Goal (No Details)' : goal.playerName}
                      </span>
                      <span className="text-muted-foreground ml-2">({goal.team})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize flex items-center gap-1">
                      {goal.type === 'goal' && <Target className="h-3 w-3" />}
                      {goal.type}
                    </div>
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
