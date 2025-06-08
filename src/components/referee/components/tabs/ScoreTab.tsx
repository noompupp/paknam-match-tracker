import { useState } from "react";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Timer, Save, RotateCcw } from "lucide-react";
import GoalEntryWizard from "../GoalEntryWizard";
import TeamSelectionModal from "../TeamSelectionModal";
import QuickGoalSelectionModal from "../QuickGoalSelectionModal";
import QuickGoalEditWizard from "../QuickGoalEditWizard";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";
import SimplifiedQuickGoalSection from "./components/SimplifiedQuickGoalSection";
import { useUnassignedGoals } from "@/hooks/useUnassignedGoals";
import { useStableScoreSync } from "@/hooks/useStableScoreSync";

interface ScoreTabProps {
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
  isRunning: boolean;
  goals: any[];
  matchTime: number;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
  onQuickGoal?: (team: 'home' | 'away') => void;
  onOpenGoalWizard?: () => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  forceRefresh?: () => Promise<void>;
}

const ScoreTab = ({
  selectedFixtureData,
  isRunning,
  goals,
  matchTime,
  homeTeamPlayers,
  awayTeamPlayers,
  formatTime,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
  onAssignGoal,
  forceRefresh
}: ScoreTabProps) => {
  const [showWizard, setShowWizard] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [showQuickGoalSelection, setShowQuickGoalSelection] = useState(false);
  const [showQuickGoalEdit, setShowQuickGoalEdit] = useState(false);
  const [selectedQuickGoal, setSelectedQuickGoal] = useState<any>(null);
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  // Use stable score sync instead of props to prevent glitches
  const { homeScore, awayScore, forceRefresh: forceScoreRefresh } = useStableScoreSync({
    fixtureId: selectedFixtureData?.id,
    onScoreUpdate: (newHome, newAway) => {
      console.log('📊 ScoreTab: Stable score update received:', { newHome, newAway });
    }
  });

  // Use the database-driven unassigned goals hook with enhanced refresh
  const { unassignedGoalsCount, refreshUnassignedGoals } = useUnassignedGoals({
    fixtureId: selectedFixtureData?.id,
    refreshTrigger
  });

  console.log('📊 ScoreTab: Using stable scores:', { homeScore, awayScore, unassignedGoalsCount });

  // Enhanced quick goal handler with stable sync
  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!selectedFixtureData || isProcessingQuickGoal) return;

    setIsProcessingQuickGoal(true);

    try {
      console.log('⚡ ScoreTab: Adding quick goal for team:', team);
      
      const homeTeamId = selectedFixtureData.home_team?.__id__ || selectedFixtureData.home_team_id;
      const awayTeamId = selectedFixtureData.away_team?.__id__ || selectedFixtureData.away_team_id;

      const result = await quickGoalService.addQuickGoal({
        fixtureId: selectedFixtureData.id,
        team,
        matchTime,
        homeTeam: {
          id: homeTeamId,
          name: selectedFixtureData.home_team?.name,
          __id__: homeTeamId
        },
        awayTeam: {
          id: awayTeamId,
          name: selectedFixtureData.away_team?.name,
          __id__: awayTeamId
        }
      });

      if (result.success) {
        toast({
          title: "⚡ Quick Goal Added!",
          description: result.message,
        });
        
        // Trigger refresh of unassigned goals count and stable score sync
        setRefreshTrigger(prev => prev + 1);
        
        // Use stable score refresh instead of legacy force refresh
        setTimeout(() => {
          forceScoreRefresh();
          refreshUnassignedGoals();
        }, 300);
        
        onSaveMatch();
      } else {
        toast({
          title: "Quick Goal Failed",
          description: result.error || 'Failed to add quick goal',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ ScoreTab: Error adding quick goal:', error);
      toast({
        title: "Quick Goal Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessingQuickGoal(false);
    }
  };

  const handleQuickGoalClick = () => {
    setShowTeamSelection(true);
  };

  const handleFullGoalEntryClick = () => {
    setShowWizard(true);
  };

  const handleAddDetailsToGoalsClick = () => {
    console.log('📝 ScoreTab: Add details to goals clicked, opening selection modal');
    setShowQuickGoalSelection(true);
  };

  const handleTeamSelected = (team: 'home' | 'away') => {
    handleQuickGoal(team);
  };

  const handleQuickGoalSelected = (goal: any) => {
    console.log('🎯 ScoreTab: Quick goal selected for editing:', goal);
    setSelectedQuickGoal(goal);
    setShowQuickGoalSelection(false);
    setShowQuickGoalEdit(true);
  };

  const handleQuickGoalUpdated = (updatedGoal: any) => {
    console.log('✅ ScoreTab: Quick goal updated:', updatedGoal);
    
    // Trigger refresh of unassigned goals count and stable score sync
    setRefreshTrigger(prev => prev + 1);
    
    setTimeout(() => {
      forceScoreRefresh();
      refreshUnassignedGoals();
    }, 300);
    
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
    console.log('🎯 ScoreTab: Goal assigned via wizard:', goalData);
    onAssignGoal(goalData.player);
    
    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      setTimeout(() => {
        onAssignGoal(goalData.assistPlayer!);
      }, 100);
    }
    
    // Trigger refresh of unassigned goals count and stable score sync
    setRefreshTrigger(prev => prev + 1);
    
    setTimeout(() => {
      forceScoreRefresh();
      refreshUnassignedGoals();
    }, 300);
    
    setShowWizard(false);
  };

  if (showQuickGoalEdit && selectedQuickGoal) {
    return (
      <div className="space-y-6">
        <QuickGoalEditWizard
          quickGoal={selectedQuickGoal}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          formatTime={formatTime}
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
          selectedFixtureData={selectedFixtureData}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          matchTime={matchTime}
          formatTime={formatTime}
          onGoalAssigned={handleWizardGoalAssigned}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Score Display with Stable Sync */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">{homeTeamName}</h3>
              <div className="text-5xl font-bold text-primary">{homeScore}</div>
            </div>
            
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-muted-foreground mb-2">VS</div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-lg font-mono">{formatTime(matchTime)}</span>
              </div>
              <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                {isRunning ? 'Live' : 'Paused'}
              </div>
            </div>
            
            <div className="text-center flex-1">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">{awayTeamName}</h3>
              <div className="text-5xl font-bold text-primary">{awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Simplified Goal Recording with Modal Flow */}
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

      {/* Quick Goal Selection Modal */}
      <QuickGoalSelectionModal
        isOpen={showQuickGoalSelection}
        onClose={() => setShowQuickGoalSelection(false)}
        onGoalSelected={handleQuickGoalSelected}
        fixtureId={selectedFixtureData?.id}
        formatTime={formatTime}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />

      {/* Match Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Match Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={onToggleTimer}
              variant={isRunning ? "destructive" : "default"}
              className="h-12"
            >
              {isRunning ? 'Pause Timer' : 'Start Timer'}
            </Button>
            
            <Button
              onClick={onSaveMatch}
              variant="outline"
              className="h-12"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Match
            </Button>
          </div>
          
          <Button
            onClick={onResetMatch}
            variant="outline"
            className="w-full h-12"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Match
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreTab;
