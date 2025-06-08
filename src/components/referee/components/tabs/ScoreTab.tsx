
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save, Target, Zap } from "lucide-react";

interface ScoreTabProps {
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
  onQuickGoal: (team: 'home' | 'away') => void;
  onOpenGoalWizard: () => void;
}

const ScoreTab = ({
  homeScore,
  awayScore,
  selectedFixtureData,
  isRunning,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
  onQuickGoal,
  onOpenGoalWizard
}: ScoreTabProps) => {
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  return (
    <div className="space-y-6">
      {/* Live Score Display */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h3 className="text-lg font-semibold mb-2">{homeTeamName}</h3>
              <div className="text-6xl font-bold text-primary">{homeScore}</div>
            </div>
            
            <div className="text-center px-6">
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
            </div>
            
            <div className="text-center flex-1">
              <h3 className="text-lg font-semibold mb-2">{awayTeamName}</h3>
              <div className="text-6xl font-bold text-primary">{awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Goal Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onQuickGoal('home')}
              variant="outline"
              className="h-16 text-lg flex flex-col items-center gap-1"
            >
              <Zap className="h-5 w-5" />
              <span>Goal</span>
              <span className="text-sm font-normal">{homeTeamName}</span>
            </Button>
            <Button
              onClick={() => onQuickGoal('away')}
              variant="outline"
              className="h-16 text-lg flex flex-col items-center gap-1"
            >
              <Zap className="h-5 w-5" />
              <span>Goal</span>
              <span className="text-sm font-normal">{awayTeamName}</span>
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <Button
              onClick={onOpenGoalWizard}
              className="w-full h-12"
              variant="default"
            >
              <Target className="h-4 w-4 mr-2" />
              Detailed Goal Entry
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Assign player, handle assists, and own goals
            </p>
          </div>
        </CardContent>
      </Card>

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
