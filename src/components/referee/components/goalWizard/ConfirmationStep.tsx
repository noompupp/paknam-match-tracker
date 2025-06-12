
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { GoalWizardData } from "./types";
import { Target, Clock, User, Users, AlertTriangle } from "lucide-react";

interface ConfirmationStepProps {
  selectedFixtureData: any;
  wizardData: GoalWizardData;
  matchTime: number;
  formatTime: (seconds: number) => string;
  onConfirm: () => void;
}

const ConfirmationStep = ({
  selectedFixtureData,
  wizardData,
  matchTime,
  formatTime,
  onConfirm
}: ConfirmationStepProps) => {
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';
  const teamName = wizardData.selectedTeam === 'home' ? homeTeamName : awayTeamName;

  const getGoalTypeLabel = () => {
    if (wizardData.isOwnGoal) return 'Own Goal';
    return 'Goal';
  };

  const getScoreImpact = () => {
    if (wizardData.isOwnGoal) {
      // Own goal benefits the opposing team
      const beneficiaryTeam = wizardData.selectedTeam === 'home' ? awayTeamName : homeTeamName;
      return `+1 for ${beneficiaryTeam} (own goal)`;
    } else {
      // Regular goal benefits the player's team
      return `+1 for ${teamName}`;
    }
  };

  console.log('🎯 ConfirmationStep: Rendering confirmation with data:', {
    wizardData,
    teamName,
    matchTime,
    isOwnGoal: wizardData.isOwnGoal
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Confirm Goal Details</h3>
        <p className="text-muted-foreground">
          Please review the goal information before confirming
        </p>
      </div>

      {/* Goal Summary Card */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-4">
        {/* Player Info */}
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          <div>
            <div className="font-medium">{wizardData.selectedPlayer?.name}</div>
            <div className="text-sm text-muted-foreground">
              {teamName}
              {wizardData.selectedPlayer?.number && (
                <Badge variant="outline" className="ml-2 text-xs">
                  #{wizardData.selectedPlayer.number}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Goal Type */}
        <div className="flex items-center gap-3">
          {wizardData.isOwnGoal ? (
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          ) : (
            <Target className="h-5 w-5 text-green-600" />
          )}
          <div>
            <div className="font-medium flex items-center gap-2">
              {getGoalTypeLabel()}
              {wizardData.isOwnGoal && (
                <Badge variant="destructive" className="text-xs">
                  Own Goal
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Score Impact: {getScoreImpact()}
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-600" />
          <div>
            <div className="font-medium">{formatTime(matchTime)}</div>
            <div className="text-sm text-muted-foreground">Match time</div>
          </div>
        </div>

        {/* Assist Info */}
        {wizardData.assistPlayer && !wizardData.isOwnGoal && (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium">Assisted by {wizardData.assistPlayer.name}</div>
              <div className="text-sm text-muted-foreground">
                {teamName}
                {wizardData.assistPlayer.number && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    #{wizardData.assistPlayer.number}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning for Own Goals */}
      {wizardData.isOwnGoal && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Own Goal Confirmation</span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            This will be recorded as an own goal by {wizardData.selectedPlayer?.name}, 
            adding a point to the opposing team's score.
          </p>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        onClick={onConfirm}
        className="w-full"
        size="lg"
      >
        Confirm {getGoalTypeLabel()}
      </Button>
    </div>
  );
};

export default ConfirmationStep;
