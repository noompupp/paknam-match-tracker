
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Target, Users } from "lucide-react";
import { BaseStepProps } from "./types";

interface ConfirmationStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'wizardData'> {
  onConfirm: () => void;
  onBack: () => void;
  matchTime?: number;
  formatTime?: (seconds: number) => string;
}

const ConfirmationStep = ({ 
  selectedFixtureData, 
  wizardData, 
  onConfirm, 
  onBack,
  matchTime,
  formatTime 
}: ConfirmationStepProps) => {
  const { selectedPlayer, selectedTeam, isOwnGoal, needsAssist, assistPlayer } = wizardData;

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  if (!selectedPlayer || !selectedTeam) return null;

  const scoringTeamName = getTeamName(selectedTeam);
  const playerTeamName = selectedPlayer.team;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Confirm Goal Assignment</h3>
        <p className="text-muted-foreground">
          Please review the goal details before saving
        </p>
        {matchTime && formatTime && (
          <p className="text-sm text-muted-foreground mt-1">
            Time: {formatTime(matchTime)}
          </p>
        )}
      </div>

      {/* Goal Summary Card */}
      <Card className={`${isOwnGoal ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {isOwnGoal ? (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Own Goal Summary
              </>
            ) : (
              <>
                <Target className="h-5 w-5 text-green-600" />
                Goal Summary
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scorer</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedPlayer.name}</span>
                {selectedPlayer.number && (
                  <Badge variant="outline" className="text-xs">
                    #{selectedPlayer.number}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scorer's Team</p>
              <span className="font-medium">{playerTeamName}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Goal Benefits</p>
              <span className="font-medium">{scoringTeamName}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Goal Type</p>
              <Badge variant={isOwnGoal ? "destructive" : "default"}>
                {isOwnGoal ? "Own Goal" : "Regular Goal"}
              </Badge>
            </div>
          </div>

          {needsAssist && assistPlayer && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Assist Information</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assist By</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{assistPlayer.name}</span>
                    {assistPlayer.number && (
                      <Badge variant="outline" className="text-xs">
                        #{assistPlayer.number}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assist Team</p>
                  <span className="font-medium">{assistPlayer.team}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Own Goal Warning */}
      {isOwnGoal && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Own Goal Impact</span>
          </div>
          <ul className="text-sm text-orange-700 mt-2 space-y-1">
            <li>• Goal will be added to {scoringTeamName}'s score</li>
            <li>• {selectedPlayer.name}'s positive stats will NOT be affected</li>
            <li>• Event will be recorded as an own goal in match history</li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back to Edit
        </Button>
        <Button onClick={onConfirm} className="flex-1" size="lg">
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirm & Save Goal
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
