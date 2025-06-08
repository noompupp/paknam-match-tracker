
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import QuickGoalEntry from "../QuickGoalEntry";

interface ScoreTabProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
  onQuickGoal?: (team: 'home' | 'away') => void;
  onOpenGoalWizard?: () => void;
}

const ScoreTab = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  isRunning,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
  onQuickGoal,
  onOpenGoalWizard
}: ScoreTabProps) => {
  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No fixture selected</p>
        </CardContent>
      </Card>
    );
  }

  const homeTeamName = selectedFixtureData.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData.away_team?.name || 'Away Team';

  return (
    <div className="space-y-6">
      {/* Current Score Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Current Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{homeTeamName}</h3>
              <div className="text-6xl font-bold text-primary">{homeScore}</div>
            </div>
            <div className="text-4xl font-bold text-muted-foreground">-</div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{awayTeamName}</h3>
              <div className="text-6xl font-bold text-primary">{awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Goal Entry for Live Scoring */}
      {isRunning && onQuickGoal && onOpenGoalWizard && (
        <Card>
          <CardHeader>
            <CardTitle>Live Goal Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickGoalEntry
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
              onAddGoal={onQuickGoal}
              onOpenWizard={onOpenGoalWizard}
            />
          </CardContent>
        </Card>
      )}

      {/* Match Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Match Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={onToggleTimer}
              variant={isRunning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Pause Match' : 'Start Match'}
            </Button>
            
            <Button 
              onClick={onSaveMatch}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Match
            </Button>
            
            <Button 
              onClick={onResetMatch}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Match
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Persistence Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-success">✅ Enhanced Goal Entry Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <h4 className="font-semibold text-foreground">New Step-by-Step Goal Entry:</h4>
            <p>• Quick goal buttons for immediate scoring during live matches</p>
            <p>• Detailed wizard for accurate player and assist assignment</p>
            <p>• Automatic own goal detection and handling</p>
            <p>• Streamlined assist workflow with smart defaults</p>
            
            <h4 className="font-semibold text-foreground mt-4">Improved Accuracy Features:</h4>
            <p>• ✅ Team selection before player selection</p>
            <p>• ✅ Visual step indicator and progress tracking</p>
            <p>• ✅ Own goal detection with opposing team players</p>
            <p>• ✅ Conditional assist flow (skipped for own goals)</p>
            <p>• ✅ Comprehensive confirmation step</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreTab;
