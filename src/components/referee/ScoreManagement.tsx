
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Play, Square, RotateCcw, Save, CheckCircle } from "lucide-react";
import { Fixture } from "@/types/database";

interface ScoreManagementProps {
  selectedFixtureData: Fixture;
  homeScore: number;
  awayScore: number;
  isRunning: boolean;
  isPending: boolean;
  onAddGoal: (team: 'home' | 'away') => void;
  onRemoveGoal: (team: 'home' | 'away') => void;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
}

const ScoreManagement = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  isRunning,
  isPending,
  onAddGoal,
  onRemoveGoal,
  onToggleTimer,
  onResetMatch,
  onSaveMatch
}: ScoreManagementProps) => {
  const getTeamLogo = (team: any) => {
    if (team?.logoURL) {
      return (
        <img 
          src={team.logoURL} 
          alt={`${team.name} logo`} 
          className="w-6 h-6 object-contain rounded border border-gray-200" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    return <span className="text-xl">{team?.logo || '⚽'}</span>;
  };

  const isMatchComplete = selectedFixtureData.status === 'completed';
  const hasScoreChange = homeScore !== (selectedFixtureData.home_score || 0) || awayScore !== (selectedFixtureData.away_score || 0);

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Score Management</CardTitle>
          {isMatchComplete && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Match Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {getTeamLogo(selectedFixtureData.home_team)}
                <span className="text-xl hidden">{selectedFixtureData.home_team?.logo || '⚽'}</span>
              </div>
              <span className="font-medium">{selectedFixtureData.home_team?.name}</span>
              <Badge variant="outline" className="text-xs">Home</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onRemoveGoal('home')}
                disabled={homeScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-3xl font-bold w-12 text-center bg-background rounded px-2 py-1">
                {homeScore}
              </span>
              <Button size="sm" onClick={() => onAddGoal('home')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {getTeamLogo(selectedFixtureData.away_team)}
                <span className="text-xl hidden">{selectedFixtureData.away_team?.logo || '⚽'}</span>
              </div>
              <span className="font-medium">{selectedFixtureData.away_team?.name}</span>
              <Badge variant="outline" className="text-xs">Away</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onRemoveGoal('away')}
                disabled={awayScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-3xl font-bold w-12 text-center bg-background rounded px-2 py-1">
                {awayScore}
              </span>
              <Button size="sm" onClick={() => onAddGoal('away')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Current Score Display */}
        <div className="text-center py-3 bg-primary/10 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Current Score</div>
          <div className="text-2xl font-bold">
            {selectedFixtureData.home_team?.name || 'Home'} {homeScore} - {awayScore} {selectedFixtureData.away_team?.name || 'Away'}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onToggleTimer} className="flex-1" variant={isRunning ? "destructive" : "default"}>
            {isRunning ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? 'Stop Match' : 'Start Match'}
          </Button>
          <Button variant="outline" onClick={onResetMatch}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        
        <Button 
          onClick={onSaveMatch} 
          className="w-full" 
          disabled={isPending || (!hasScoreChange && !isMatchComplete)}
          variant={hasScoreChange ? "default" : "secondary"}
        >
          <Save className="h-4 w-4 mr-2" />
          {isPending ? 'Saving Match...' : 
           isMatchComplete ? 'Update Match Result' : 
           hasScoreChange ? 'Save Match Result' : 'No Changes to Save'}
        </Button>

        {hasScoreChange && (
          <div className="text-xs text-muted-foreground text-center">
            Changes detected - click Save to update the match result
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreManagement;
