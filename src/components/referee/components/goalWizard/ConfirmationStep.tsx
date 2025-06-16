
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Target, Users } from "lucide-react";
import { BaseStepProps } from "./types";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
  const { selectedPlayer, selectedTeam, isOwnGoal, needsAssist, assistPlayer } = wizardData;

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || t('referee.homeTeam', 'Home Team');
    return selectedFixtureData?.away_team?.name || t('referee.awayTeam', 'Away Team');
  };

  if (!selectedPlayer || !selectedTeam) return null;

  const scoringTeamName = getTeamName(selectedTeam);
  const playerTeamName = selectedPlayer.team;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          {t('wizard.confirmGoalAssignment', 'Confirm Goal Assignment')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('wizard.reviewGoalDetails', 'Please review the goal details before saving')}
        </p>
        {matchTime && formatTime && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('wizard.timeLabel', 'Time: {time}', { time: formatTime(matchTime) })}
          </p>
        )}
      </div>

      {/* Goal Summary Card - Mobile optimized */}
      <Card className={`${isOwnGoal ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            {isOwnGoal ? (
              <>
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                {t('wizard.ownGoalSummary', 'Own Goal Summary')}
              </>
            ) : (
              <>
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                {t('wizard.goalSummary', 'Goal Summary')}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t('wizard.scorer', 'Scorer')}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{selectedPlayer.name}</span>
                {selectedPlayer.number && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    #{selectedPlayer.number}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t('wizard.scorerTeam', 'Scorer\'s Team')}
              </p>
              <span className="font-medium text-sm truncate">{playerTeamName}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t('wizard.goalBenefits', 'Goal Benefits')}
              </p>
              <span className="font-medium text-sm truncate">{scoringTeamName}</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t('wizard.goalType', 'Goal Type')}
              </p>
              <Badge variant={isOwnGoal ? "destructive" : "default"} className="text-xs">
                {isOwnGoal ? t('wizard.ownGoal', 'Own Goal') : t('wizard.regularGoal', 'Regular Goal')}
              </Badge>
            </div>
          </div>

          {needsAssist && assistPlayer && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium">
                  {t('wizard.assistInformation', 'Assist Information')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('wizard.assistBy', 'Assist By')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{assistPlayer.name}</span>
                    {assistPlayer.number && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        #{assistPlayer.number}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('wizard.assistTeam', 'Assist Team')}
                  </p>
                  <span className="font-medium text-sm truncate">{assistPlayer.team}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Own Goal Warning - Mobile optimized */}
      {isOwnGoal && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="font-medium text-sm">
                {t('wizard.ownGoalImpact', 'Own Goal Impact')}
              </span>
              <ul className="text-xs sm:text-sm text-orange-700 mt-2 space-y-1">
                <li>• {t('wizard.ownGoalImpactBullet1', 'Goal will be added to {scoringTeam}\'s score', { scoringTeam: scoringTeamName })}</li>
                <li>• {t('wizard.ownGoalImpactBullet2', '{playerName}\'s positive stats will NOT be affected', { playerName: selectedPlayer.name })}</li>
                <li>• {t('wizard.ownGoalImpactBullet3', 'Event will be recorded as an own goal in match history')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Mobile optimized */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 order-2 sm:order-1">
          {t('wizard.backToEdit', 'Back to Edit')}
        </Button>
        <Button onClick={onConfirm} className="flex-1 order-1 sm:order-2" size="lg">
          <CheckCircle className="h-4 w-4 mr-2" />
          {t('wizard.confirmAndSaveGoal', 'Confirm & Save Goal')}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
