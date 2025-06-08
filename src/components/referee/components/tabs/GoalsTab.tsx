
import { useState } from "react";
import GoalEntryWizard from "../GoalEntryWizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { Trophy, Clock } from "lucide-react";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";
import TeamSelectionModal from "../TeamSelectionModal";
import QuickGoalSelectionModal from "../QuickGoalSelectionModal";
import QuickGoalEditWizard from "../QuickGoalEditWizard";
import SimplifiedGoalRecording from "./components/SimplifiedGoalRecording";

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
  const [showQuickGoalSelection, setShowQuickGoalSelection] = useState(false);
  const [showQuickGoalEdit, setShowQuickGoalEdit] = useState(false);
  const [selectedQuickGoal, setSelectedQuickGoal] = useState<any>(null);
  const [wizardInitialTeam, setWizardInitialTeam] = useState<'home' | 'away' | undefined>(undefined);
  const [wizardMode, setWizardMode] = useState<'quick' | 'detailed' | 'assign'>('quick');
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [teamSelectionMode, setTeamSelectionMode] = useState<'quick' | 'detailed'>('quick');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const homeTeamName = props.selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = props.selectedFixtureData?.away_team?.name || 'Away Team';

  // Use props for scores and calculate unassigned goals from props
  const { homeScore, awayScore } = props;
  const unassignedGoalsCount = props.goals.filter(g => g.playerName === 'Quick Goal').length;

  console.log('📊 GoalsTab: Using props scores:', { homeScore, awayScore, unassignedGoalsCount });

  // Enhanced quick goal handler
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
        
        // Trigger refresh
        setRefreshTrigger(prev => prev + 1);
        
        if (props.forceRefresh) {
          setTimeout(() => {
            props.forceRefresh!();
          }, 300);
        }
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

  // Handle goal recording - simplified to only show wizard
  const handleRecordGoal = () => {
    setShowWizard(true);
  };

  // Handle team selection from modal
  const handleTeamSelected = (team: 'home' | 'away') => {
    if (teamSelectionMode === 'quick') {
      handleQuickGoal(team);
    } else {
      setWizardInitialTeam(team);
      setShowWizard(true);
    }
  };

  // Handle quick goal selection from modal
  const handleQuickGoalSelected = (goal: any) => {
    console.log('🎯 GoalsTab: Quick goal selected for editing:', goal);
    setSelectedQuickGoal(goal);
    setShowQuickGoalSelection(false);
    setShowQuickGoalEdit(true);
  };

  // Handle quick goal update completion
  const handleQuickGoalUpdated = (updatedGoal: any) => {
    console.log('✅ GoalsTab: Quick goal updated:', updatedGoal);
    
    setRefreshTrigger(prev => prev + 1);
    
    if (props.forceRefresh) {
      setTimeout(() => {
        props.forceRefresh!();
      }, 300);
    }
    
    setShowQuickGoalEdit(false);
    setSelectedQuickGoal(null);
    
    toast({
      title: "Goal Updated!",
      description: `Goal assigned to ${updatedGoal.player?.name}`,
    });
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
    
    setRefreshTrigger(prev => prev + 1);
    
    if (props.forceRefresh) {
      setTimeout(() => {
        props.forceRefresh!();
      }, 300);
    }
    
    setShowWizard(false);
    setWizardInitialTeam(undefined);
  };

  // Show quick goal edit wizard
  if (showQuickGoalEdit && selectedQuickGoal) {
    return (
      <div className="space-y-6">
        <QuickGoalEditWizard
          quickGoal={selectedQuickGoal}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          formatTime={props.formatTime}
          onGoalUpdated={handleQuickGoalUpdated}
          onCancel={() => {
            setShowQuickGoalEdit(false);
            setSelectedQuickGoal(null);
          }}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
        />
      </div>
    );
  }

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

      {/* Simplified Goal Recording Section */}
      <SimplifiedGoalRecording
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onRecordGoal={handleRecordGoal}
        isDisabled={false}
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

      {/* Quick Goal Selection Modal */}
      <QuickGoalSelectionModal
        isOpen={showQuickGoalSelection}
        onClose={() => setShowQuickGoalSelection(false)}
        onGoalSelected={handleQuickGoalSelected}
        goals={props.goals.filter(g => g.playerName === 'Quick Goal')}
        formatTime={props.formatTime}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
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
