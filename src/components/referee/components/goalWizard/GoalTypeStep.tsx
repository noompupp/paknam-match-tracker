
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, AlertTriangle, Target } from "lucide-react";
import { BaseStepProps } from "./types";
import { useTranslation } from "@/hooks/useTranslation";

interface GoalTypeStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'wizardData' | 'onNext' | 'onDataChange'> {}

const GoalTypeStep = ({ selectedFixtureData, wizardData, onNext, onDataChange }: GoalTypeStepProps) => {
  const { t } = useTranslation();
  const { selectedPlayer, selectedTeam, isOwnGoal } = wizardData;

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || t('referee.homeTeam', 'Home Team');
    return selectedFixtureData?.away_team?.name || t('referee.awayTeam', 'Away Team');
  };

  const handleOwnGoalToggle = (ownGoalValue: boolean) => {
    onDataChange({ isOwnGoal: ownGoalValue });
  };

  if (!selectedPlayer || !selectedTeam) return null;

  const playerTeamName = selectedPlayer.team;
  const scoringTeamName = getTeamName(selectedTeam);
  const isPlayerFromDifferentTeam = playerTeamName !== scoringTeamName;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          {t('wizard.confirmGoalType', 'Confirm Goal Type')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('wizard.reviewGoalDetails', 'Please confirm the type of goal being scored')}
        </p>
      </div>

      {/* Player and Team Info Summary - Mobile optimized */}
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <strong>{t('wizard.scorer', 'Scorer')}:</strong> 
            <span className="truncate">{selectedPlayer.name}</span>
            {selectedPlayer.number && (
              <Badge variant="outline" className="text-xs shrink-0">
                #{selectedPlayer.number}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <strong>{t('wizard.scorerTeam', 'Player\'s Team')}:</strong> 
            <span className="truncate">{playerTeamName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <strong>{t('wizard.goalBenefits', 'Goal benefits')}:</strong> 
          <span className="truncate">{scoringTeamName}</span>
        </div>
        
        {isPlayerFromDifferentTeam && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2 text-orange-800 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="font-medium">
                  {t('wizard.crossTeamGoalDetected', 'Cross-team Goal Detected')}
                </span>
                <p className="text-xs text-orange-700 mt-1">
                  {t('wizard.crossTeamGoalSuggestion', 'This player is from {playerTeam} but the goal benefits {scoringTeam}. This suggests it might be an own goal.', {
                    playerTeam: playerTeamName,
                    scoringTeam: scoringTeamName
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goal Type Selection - Mobile optimized */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm sm:text-base">
          {t('wizard.goalType', 'Select Goal Type')}:
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Regular Goal Option */}
          <Card 
            className={`cursor-pointer transition-all touch-manipulation ${
              !isOwnGoal ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleOwnGoalToggle(false)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base">
                    {t('wizard.regularGoal', 'Regular Goal')}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {t('wizard.goalScoredForOwnTeam', 'Goal scored for player\'s own team')}
                  </div>
                </div>
                {!isOwnGoal && (
                  <Badge variant="default" className="bg-blue-600 shrink-0 text-xs">
                    {t('wizard.selected', 'Selected')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Own Goal Option */}
          <Card 
            className={`cursor-pointer transition-all touch-manipulation ${
              isOwnGoal ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleOwnGoalToggle(true)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base">
                    {t('wizard.ownGoal', 'Own Goal')}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {t('wizard.goalAccidentallyScored', 'Goal accidentally scored against player\'s own team')}
                  </div>
                </div>
                {isOwnGoal && (
                  <Badge variant="destructive" className="shrink-0 text-xs">
                    {t('wizard.selected', 'Selected')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Warning for Own Goals - Mobile optimized */}
      {isOwnGoal && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="font-medium text-sm">
                {t('wizard.ownGoalWarning', 'Own Goal Warning')}
              </span>
              <p className="text-xs sm:text-sm text-orange-700 mt-1">
                {t('wizard.ownGoalRecordedAs', 'This will be recorded as an own goal by {playerName} from {playerTeam}, which will add a point to {scoringTeam}\'s score.', {
                  playerName: selectedPlayer.name,
                  playerTeam: playerTeamName,
                  scoringTeam: scoringTeamName
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      <Button onClick={onNext} className="w-full" size="lg">
        {isOwnGoal 
          ? t('wizard.continueToConfirmation', 'Continue to Confirmation')
          : t('wizard.continueToAssist', 'Continue to Assist Selection')
        }
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default GoalTypeStep;
