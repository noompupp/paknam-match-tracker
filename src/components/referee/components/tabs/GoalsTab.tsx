
import { useState } from "react";
import GoalEntryWizard from "../GoalEntryWizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { Trophy, Clock } from "lucide-react";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";
import TeamSelectionModal from "../TeamSelectionModal";
import SimplifiedQuickGoalSection from "./components/SimplifiedQuickGoalSection";
import { useUnassignedGoals } from "@/hooks/useUnassignedGoals";
import { useStableScoreSync } from "@/hooks/useStableScoreSync";

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
  const [showWizard, setShowWizard] = useState(false);
  const [wizardInitialTeam, setWizardInitialTeam] = useState<'home' | 'away' | undefined>(undefined);
  const [wizardMode, setWizardMode] = useState<'quick' | 'detailed' | 'assign'>('quick');
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [teamSelectionMode, setTeamSelectionMode] = useState<'quick' | 'detailed'>('quick');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const homeTeamName = props.selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = props.selectedFixtureData?.away_team?.name || 'Away Team';

  // Use stable score sync instead of props to prevent glitches
  const { homeScore, awayScore, forceRefresh: forceScoreRefresh } = useStableScoreSync({
    fixtureId: props.selectedFixtureData?.id,
    onScoreUpdate: (newHome, newAway) => {
      console.log('📊 GoalsTab: Stable score update received:', { newHome, newAway });
    }
  });

  // Use the database-driven unassigned goals hook with enhanced refresh
  const { unassignedGoalsCount, refreshUnassignedGoals } = useUnassignedGoals({
    fixtureId: props.selectedFixtureData?.id,
    refreshTrigger
  });

  console.log('📊 GoalsTab: Using stable scores:', { homeScore, awayScore, unassignedGoalsCount });

  // Enhanced quick goal handler with stable sync
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
        
        // Trigger refresh of unassigned goals count and stable score sync
        setRefreshTrigger(prev => prev + 1);
        
        setTimeout(() => {
          forceScoreRefresh();
          refreshUnassignedGoals();
        }, 300);
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

  // Handle quick goal button click - opens team selection
  const handleQuickGoalClick = () => {
    setTeamSelectionMode('quick');
    setShowTeamSelection(true);
  };

  // Handle full goal entry button click - opens wizard directly
  const handleFullGoalEntryClick = () => {
    setWizardMode('detailed');
    setShowWizard(true);
  };

  // Enhanced add details to goals button click with proper logging
  const handleAddDetailsToGoalsClick = () => {
    console.log('📝 GoalsTab: Add details to goals clicked, unassigned count:', unassignedGoalsCount);
    if (unassignedGoalsCount > 0) {
      setWizardMode('assign');
      setShowWizard(true);
    } else {
      console.log('⚠️ GoalsTab: No unassigned goals to add details to');
      toast({
        title: "No Unassigned Goals",
        description: "There are no quick goals that need player details added.",
        variant: "default"
      });
    }
  };

  // Handle team selection from modal
  const handleTeamSelected = (team: 'home' | 'away') => {
    if (teamSelectionMode === 'quick') {
      handleQuickGoal(team);
    } else {
      setWizardInitialTeam(team);
      setWizardMode('detailed');
      setShowWizard(true);
    }
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
    
    // Trigger refresh of unassigned goals count and stable score sync
    setRefreshTrigger(prev => prev + 1);
    
    setTimeout(() => {
      forceScoreRefresh();
      refreshUnassignedGoals();
    }, 300);
    
    setShowWizard(false);
    setWizardInitialTeam(undefined);
  };

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
      {/* Current Score Display with Stable Sync */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h3 className="text-sm font-medium text-muted-foreground">{homeTeamName}</h3>
              <div className="text-3xl font-bold text-primary">{homeScore}</div>
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
              <div className="text-3xl font-bold text-primary">{awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Simplified Goal Recording Section with Proper Add Details Behavior */}
      <SimplifiedQuickGoalSection
        unassignedGoalsCount={unassignedGoalsCount}
        isProcessingQuickGoal={isProcessingQuickGoal}
        onQuickGoal={handleQuickGoalClick}
        onFullGoalEntry={handleFullGoalEntryClick}
        onAddDetailsToGoals={handleAddDetailsToGoalsClick}
      />

      {/* Team Selection Modal */}
      <TeamSelectionModal
        isOpen={showTeamSelection}
        onClose={() => setShowTeamSelection(false)}
        onTeamSelect={handleTeamSelected}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        title="Select Team for Quick Goal"
        description="Which team scored the goal?"
      />

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
                      {goal.type === 'goal' && <Trophy className="h-3 w-3" />}
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
