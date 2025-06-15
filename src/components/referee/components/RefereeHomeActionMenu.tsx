import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Timer, 
  Target, 
  AlertTriangle, 
  Users, 
  Save, 
  RotateCcw,
  PlayCircle,
  PauseCircle,
  FileText
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface RefereeHomeActionMenuProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  unsavedChanges: {
    goals: number;
    cards: number;
    playerTimes: number;
  };
  onToggleTimer: () => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
  onQuickGoal: (team: 'home' | 'away') => void;
  onExportSummary: () => void;
}

const RefereeHomeActionMenu = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  isRunning,
  formatTime,
  unsavedChanges,
  onToggleTimer,
  onSaveMatch,
  onResetMatch,
  onQuickGoal,
  onExportSummary
}: RefereeHomeActionMenuProps) => {
  const { t } = useTranslation();
  const totalUnsavedChanges = unsavedChanges.goals + unsavedChanges.cards + unsavedChanges.playerTimes;
  const hasUnsavedChanges = totalUnsavedChanges > 0;

  if (!selectedFixtureData) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-muted-foreground">{t('referee.noMatchSelected')}</CardTitle>
          <CardDescription>{t('referee.selectMatchTooltip')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Match Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFixtureData.home_team?.name || t('referee.homeTeam')} {t('match.vs')} {selectedFixtureData.away_team?.name || t('referee.awayTeam')}
            </CardTitle>
            <Badge variant={isRunning ? 'destructive' : 'secondary'}>
              {isRunning ? t('referee.live') : t('referee.paused')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score Display */}
          <div className="text-center">
            <div className="text-4xl font-bold">
              {homeScore} - {awayScore}
            </div>
            <div className="text-lg text-muted-foreground">
              {formatTime(matchTime)}
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={onToggleTimer}
              variant={isRunning ? 'destructive' : 'default'}
              size="sm"
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <PauseCircle className="h-4 w-4" />
                  {t('referee.pause')}
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  {t('referee.start')}
                </>
              )}
            </Button>
            <Button
              onClick={onResetMatch}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t('referee.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('referee.quickActions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Goals */}
          <div className="space-y-2">
            <div className="text-sm font-medium">{t('referee.quickGoals')}</div>
            <div className="flex gap-2">
              <Button
                onClick={() => onQuickGoal('home')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {selectedFixtureData.home_team?.name || t('referee.homeTeam')} {t('event.goal')}
              </Button>
              <Button
                onClick={() => onQuickGoal('away')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {selectedFixtureData.away_team?.name || t('referee.awayTeam')} {t('event.goal')}
              </Button>
            </div>
          </div>

          {/* Save Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{t('referee.matchData')}</div>
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="text-xs">
                  {t('referee.unsaved', { count: totalUnsavedChanges })}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onSaveMatch}
                variant={hasUnsavedChanges ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2 flex-1"
                disabled={!hasUnsavedChanges}
              >
                <Save className="h-4 w-4" />
                {t('referee.saveAll')}
              </Button>
              <Button
                onClick={onExportSummary}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {t('referee.exportSummary')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unsaved Changes Summary */}
      {hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-orange-800 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              {t('referee.unsavedChanges')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unsavedChanges.goals > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-3 w-3" />
                <span>{t(`referee.goals`, { count: unsavedChanges.goals })}</span>
              </div>
            )}
            {unsavedChanges.cards > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-3 w-3" />
                <span>{t(`referee.cards`, { count: unsavedChanges.cards })}</span>
              </div>
            )}
            {unsavedChanges.playerTimes > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-3 w-3" />
                <span>{t(`referee.playerTimes`, { count: unsavedChanges.playerTimes })}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RefereeHomeActionMenu;
