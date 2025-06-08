
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save, Target, Zap, Clock, Trophy, Edit } from "lucide-react";
import GoalEntryWizard from "../GoalEntryWizard";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";

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
  onQuickGoal: (team: 'home' | 'away') => void;
  onOpenGoalWizard: () => void;
  onAssignGoal: (player: ComponentPlayer) => void;
}

const ScoreTab = ({
  homeScore,
  awayScore,
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
  onAssignGoal
}: ScoreTabProps) => {
  const [showDetailedEntry, setShowDetailedEntry] = useState(false);
  const [quickGoalTeam, setQuickGoalTeam] = useState<'home' | 'away' | null>(null);
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);
  const { toast } = useToast();

  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

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
        
        if (onSaveMatch) {
          onSaveMatch();
        }
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

  const handleDetailedGoalEntry = (team: 'home' | 'away') => {
    setQuickGoalTeam(team);
    setShowDetailedEntry(true);
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
    
    setShowDetailedEntry(false);
    setQuickGoalTeam(null);
  };

  // Get unassigned goals for the indicator
  const unassignedGoals = goals.filter(goal => 
    goal.playerName === 'Quick Goal' || goal.playerName === 'Unknown Player'
  );

  if (showDetailedEntry) {
    return (
      <div className="space-y-6">
        <GoalEntryWizard
          selectedFixtureData={selectedFixtureData}
          homeTeamPlayers={homeTeamPlayers}
          awayTeamPlayers={awayTeamPlayers}
          matchTime={matchTime}
          formatTime={formatTime}
          onGoalAssigned={handleWizardGoalAssigned}
          onCancel={() => {
            setShowDetailedEntry(false);
            setQuickGoalTeam(null);
          }}
          initialTeam={quickGoalTeam || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Live Score Display */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h3 className="text-lg font-semibold mb-2">{homeTeamName}</h3>
              <div className="text-6xl font-bold text-primary">{homeScore}</div>
            </div>
            
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-muted-foreground mb-2">VS</div>
              <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{formatTime(matchTime)}</span>
              </div>
              <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                isRunning ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isRunning ? '● LIVE' : '⏸ PAUSED'}
              </div>
            </div>
            
            <div className="text-center flex-1">
              <h3 className="text-lg font-semibold mb-2">{awayTeamName}</h3>
              <div className="text-6xl font-bold text-primary">{awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Goal Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            Quick Goal Entry
            {unassignedGoals.length > 0 && (
              <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                {unassignedGoals.length} need details
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleQuickGoal('home')}
              disabled={isProcessingQuickGoal}
              variant="outline"
              className="h-16 text-lg flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300 border-2"
            >
              <Zap className="h-5 w-5 text-green-600" />
              <span>{isProcessingQuickGoal ? 'Adding...' : '⚡ Quick Goal'}</span>
              <span className="text-sm font-normal">{homeTeamName}</span>
            </Button>
            <Button
              onClick={() => handleQuickGoal('away')}
              disabled={isProcessingQuickGoal}
              variant="outline"
              className="h-16 text-lg flex flex-col items-center gap-1 hover:bg-green-50 hover:border-green-300 border-2"
            >
              <Zap className="h-5 w-5 text-green-600" />
              <span>{isProcessingQuickGoal ? 'Adding...' : '⚡ Quick Goal'}</span>
              <span className="text-sm font-normal">{awayTeamName}</span>
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                onClick={() => handleDetailedGoalEntry('home')}
                variant="outline"
                className="h-12"
                disabled={isProcessingQuickGoal}
              >
                <Target className="h-4 w-4 mr-2" />
                Goal Entry - {homeTeamName}
              </Button>
              <Button
                onClick={() => handleDetailedGoalEntry('away')}
                variant="outline"
                className="h-12"
                disabled={isProcessingQuickGoal}
              >
                <Target className="h-4 w-4 mr-2" />
                Goal Entry - {awayTeamName}
              </Button>
            </div>
            
            <Button
              onClick={() => setShowDetailedEntry(true)}
              className="w-full h-12 mb-4"
              disabled={isProcessingQuickGoal}
            >
              <Target className="h-4 w-4 mr-2" />
              Full Goal Entry Wizard
            </Button>
            
            {unassignedGoals.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Edit className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    {unassignedGoals.length} quick goal{unassignedGoals.length !== 1 ? 's' : ''} need player details
                  </span>
                </div>
                <Button
                  onClick={() => setShowDetailedEntry(true)}
                  variant="outline"
                  className="w-full hover:bg-orange-100 hover:border-orange-300"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Assign Player Details
                </Button>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground text-center">
              <strong>Quick Goal:</strong> Instant scoring for live matches • <strong>Goal Entry:</strong> Complete details with assists
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Goals Summary */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Match Goals & Assists ({goals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      goal.playerName === 'Quick Goal' ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <span className="font-medium">
                        {goal.playerName === 'Quick Goal' ? '⚡ Quick Goal' : goal.playerName}
                      </span>
                      <span className="text-muted-foreground ml-2">({goal.team})</span>
                      {goal.playerName === 'Quick Goal' && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded">
                          needs details
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize flex items-center gap-1">
                      {goal.type === 'goal' && <Target className="h-3 w-3" />}
                      {goal.type}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatTime(goal.time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Match Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={onToggleTimer} className="h-12">
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Match
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Match
                </>
              )}
            </Button>
            <Button onClick={onSaveMatch} className="h-12">
              <Save className="h-4 w-4 mr-2" />
              Save Match
            </Button>
          </div>
          
          <Button onClick={onResetMatch} variant="destructive" className="w-full h-12">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Match
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreTab;
