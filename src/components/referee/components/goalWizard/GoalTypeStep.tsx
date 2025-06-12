
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, AlertTriangle, Target } from "lucide-react";
import { BaseStepProps } from "./types";

interface GoalTypeStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'wizardData' | 'onNext' | 'onDataChange'> {}

const GoalTypeStep = ({ selectedFixtureData, wizardData, onNext, onDataChange }: GoalTypeStepProps) => {
  const { selectedPlayer, selectedTeam, isOwnGoal } = wizardData;

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  const handleOwnGoalToggle = (ownGoalValue: boolean) => {
    console.log('🎯 GoalTypeStep: Toggling own goal flag:', {
      previousValue: isOwnGoal,
      newValue: ownGoalValue,
      player: selectedPlayer?.name,
      playerTeam: selectedPlayer?.team,
      selectedTeam: getTeamName(selectedTeam!)
    });
    
    onDataChange({ isOwnGoal: ownGoalValue });
  };

  if (!selectedPlayer || !selectedTeam) return null;

  const playerTeamName = selectedPlayer.team;
  const scoringTeamName = getTeamName(selectedTeam);
  const isPlayerFromDifferentTeam = playerTeamName !== scoringTeamName;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Confirm Goal Type</h3>
        <p className="text-muted-foreground">
          Please confirm the type of goal being scored
        </p>
      </div>

      {/* Player and Team Info Summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <strong>Scorer:</strong> {selectedPlayer.name}
          {selectedPlayer.number && (
            <Badge variant="outline" className="text-xs">
              #{selectedPlayer.number}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <strong>Player's Team:</strong> {playerTeamName}
        </div>
        <div className="flex items-center gap-2">
          <strong>Goal benefits:</strong> {scoringTeamName}
        </div>
        
        {isPlayerFromDifferentTeam && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Cross-team Goal Detected</span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              This player is from {playerTeamName} but the goal benefits {scoringTeamName}. 
              This suggests it might be an own goal.
            </p>
          </div>
        )}
      </div>

      {/* Goal Type Selection */}
      <div className="space-y-4">
        <h4 className="font-medium">Select Goal Type:</h4>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Regular Goal Option */}
          <Card 
            className={`cursor-pointer transition-all ${
              !isOwnGoal ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleOwnGoalToggle(false)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium">Regular Goal</div>
                  <div className="text-sm text-muted-foreground">
                    Goal scored for player's own team
                  </div>
                </div>
                {!isOwnGoal && (
                  <Badge variant="default" className="bg-blue-600">
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Own Goal Option */}
          <Card 
            className={`cursor-pointer transition-all ${
              isOwnGoal ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleOwnGoalToggle(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <div className="font-medium">Own Goal</div>
                  <div className="text-sm text-muted-foreground">
                    Goal accidentally scored against player's own team
                  </div>
                </div>
                {isOwnGoal && (
                  <Badge variant="destructive">
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Warning for Own Goals */}
      {isOwnGoal && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Own Goal Warning</span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            This will be recorded as an own goal by {selectedPlayer.name} from {playerTeamName}, 
            which will add a point to {scoringTeamName}'s score.
          </p>
        </div>
      )}

      <Button onClick={onNext} className="w-full" size="lg">
        Continue to {isOwnGoal ? 'Confirmation' : 'Assist Selection'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default GoalTypeStep;
