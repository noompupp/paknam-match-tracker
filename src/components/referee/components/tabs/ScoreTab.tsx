
import { useState } from "react";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Timer, Save, RotateCcw, AlertCircle } from "lucide-react";
import GoalEntryWizard from "../GoalEntryWizard";
import TeamSelectionModal from "../TeamSelectionModal";
import QuickGoalSelectionModal from "../QuickGoalSelectionModal";
import QuickGoalEditWizard from "../QuickGoalEditWizard";
import { useToast } from "@/hooks/use-toast";
import SimplifiedQuickGoalSection from "./components/SimplifiedQuickGoalSection";
import { useLocalMatchState } from "@/hooks/useLocalMatchState";
import { useBatchSaveManager } from "@/hooks/useBatchSaveManager";

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
  const { toast } = useToast();

  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';
  const homeTeamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id;
  const awayTeamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id;

  // Initialize local match state
  const {
    localState,
    unassignedGoalsCount,
    addLocalGoal,
    addLocalEvent,
    resetLocalState,
    markAsSaved
  } = useLocalMatchState({
    fixtureId: selectedFixtureData?.id,
    initialHomeScore: selectedFixtureData?.home_score || 0,
    initialAwayScore: selectedFixtureData?.away_score || 0
  });

  // Initialize batch save manager
  const { batchSave, hasUnsavedChanges, unsavedItemsCount } = useBatchSaveManager({
    fixtureId: selectedFixtureData?.id,
    localState,
    onSaveComplete: markAsSaved,
    homeTeamData: { id: homeTeamId, name: homeTeamName },
    awayTeamData: { id: awayTeamId, name: awayTeamName }
  });

  console.log('📊 ScoreTab: Using local state:', { 
    localHomeScore: localState.homeScore, 
    localAwayScore: localState.awayScore, 
    unassignedGoalsCount,
    hasUnsavedChanges,
    unsavedItemsCount
  });

  // Enhanced quick goal handler with local state
  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!selectedFixtureData || isProcessingQuickGoal) return;

    setIsProcessingQuickGoal(true);

    try {
      console.log('⚡ ScoreTab: Adding quick goal locally for team:', team);
      
      const teamId = team === 'home' ? homeTeamId : awayTeamId;
      const teamName = team === 'home' ? homeTeamName : awayTeamName;

      // Add goal to local state only
      const localGoal = addLocalGoal({
        playerName: 'Quick Goal',
        team,
        teamId,
        teamName,
        type: 'goal',
        time: matchTime
      });

      addLocalEvent('Quick Goal', `Quick goal added for ${teamName}`, matchTime);

      toast({
        title: "⚡ Quick Goal Added!",
        description: `Goal added locally for ${teamName}. Don't forget to save!`,
      });

      console.log('✅ ScoreTab: Quick goal added to local state:', localGoal);
      
    } catch (error) {
      console.error('❌ ScoreTab: Error adding quick goal:', error);
      toast({
        title: "Quick Goal Failed",
        description: "Failed to add quick goal locally",
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
    
    const teamId = goalData.team === 'home' ? homeTeamId : awayTeamId;
    const teamName = goalData.team === 'home' ? homeTeamName : awayTeamName;

    // Add goal to local state
    addLocalGoal({
      playerId: goalData.player.id,
      playerName: goalData.player.name,
      team: goalData.team,
      teamId,
      teamName,
      type: goalData.goalType,
      time: matchTime,
      isOwnGoal: goalData.isOwnGoal
    });

    // Add assist if provided
    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      addLocalGoal({
        playerId: goalData.assistPlayer.id,
        playerName: goalData.assistPlayer.name,
        team: goalData.team,
        teamId,
        teamName,
        type: 'assist',
        time: matchTime
      });
    }

    addLocalEvent('Goal Assignment', `${goalData.goalType} assigned to ${goalData.player.name}`, matchTime);
    
    setShowWizard(false);
  };

  // Enhanced save handler using batch save
  const handleSaveMatch = async () => {
    console.log('💾 ScoreTab: Save match triggered');
    await batchSave();
    
    // Also trigger the original save for backward compatibility
    onSaveMatch();
  };

  // Enhanced reset handler
  const handleResetMatch = () => {
    const confirmed = window.confirm(
      '⚠️ RESET MATCH DATA\n\n' +
      'This will reset all local match data and the database.\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you sure you want to proceed?'
    );

    if (confirmed) {
      resetLocalState();
      onResetMatch();
    }
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
      {/* Local State Score Display */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">{homeTeamName}</h3>
              <div className="text-5xl font-bold text-primary">{localState.homeScore}</div>
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
              {hasUnsavedChanges && (
                <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Local changes pending
                </div>
              )}
            </div>
            
            <div className="text-center flex-1">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">{awayTeamName}</h3>
              <div className="text-5xl font-bold text-primary">{localState.awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Goal Recording with Local State */}
      <SimplifiedQuickGoalSection
        unassignedGoalsCount={unassignedGoalsCount}
        isProcessingQuickGoal={isProcessingQuickGoal}
        onQuickGoal={handleQuickGoalClick}
        onFullGoalEntry={handleFullGoalEntryClick}
        onAddDetailsToGoals={handleAddDetailsToGoalsClick}
      />

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">Unsaved Changes</div>
                <div className="text-sm text-orange-700">
                  {unsavedItemsCount.goals} goals, {unsavedItemsCount.cards} cards, {unsavedItemsCount.playerTimes} player times
                </div>
              </div>
              <Button 
                onClick={handleSaveMatch}
                className="ml-auto"
                size="sm"
              >
                Save Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Enhanced Match Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Match Controls
            {hasUnsavedChanges && (
              <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
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
              onClick={handleSaveMatch}
              variant="outline"
              className="h-12"
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Match {hasUnsavedChanges && `(${Object.values(unsavedItemsCount).reduce((a, b) => a + b, 0)})`}
            </Button>
          </div>
          
          <Button
            onClick={handleResetMatch}
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
