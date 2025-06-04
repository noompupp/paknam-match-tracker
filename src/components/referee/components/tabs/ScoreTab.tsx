
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save } from "lucide-react";

interface ScoreTabProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
}

const ScoreTab = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  isRunning,
  onToggleTimer,
  onResetMatch,
  onSaveMatch
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
              <h3 className="text-lg font-semibold mb-2">{selectedFixtureData.home_team?.name}</h3>
              <div className="text-6xl font-bold text-primary">{homeScore}</div>
            </div>
            <div className="text-4xl font-bold text-muted-foreground">-</div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{selectedFixtureData.away_team?.name}</h3>
              <div className="text-6xl font-bold text-primary">{awayScore}</div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-semibold text-foreground">Score Management:</h4>
            <p>• Use the Goals tab to assign goals and assists to specific players</p>
            <p>• The score will automatically update when goals are assigned</p>
            <p>• Manual score adjustments have been removed to prevent inconsistencies</p>
            <p>• Save the match to update the database with the current score</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreTab;
