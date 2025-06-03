
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Play, Square, RotateCcw, Save, CheckCircle, AlertTriangle } from "lucide-react";
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
  
  // Determine save button state
  const getSaveButtonConfig = () => {
    if (isPending) {
      return {
        disabled: true,
        variant: "default" as const,
        icon: Save,
        text: "Saving Match...",
        className: "bg-blue-500 hover:bg-blue-600"
      };
    }
    
    if (isMatchComplete && !hasScoreChange) {
      return {
        disabled: true,
        variant: "secondary" as const,
        icon: CheckCircle,
        text: "Match Already Saved",
        className: "bg-green-100 text-green-700 border-green-300"
      };
    }
    
    if (hasScoreChange || !isMatchComplete) {
      return {
        disabled: false,
        variant: "default" as const,
        icon: Save,
        text: hasScoreChange ? "Save Changes" : "Save Match Result",
        className: "bg-green-600 hover:bg-green-700"
      };
    }
    
    return {
      disabled: true,
      variant: "secondary" as const,
      icon: AlertTriangle,
      text: "No Changes to Save",
      className: ""
    };
  };

  const saveConfig = getSaveButtonConfig();

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Score Management</CardTitle>
          <div className="flex gap-2">
            {isMatchComplete && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Match Completed
              </Badge>
            )}
            {hasScoreChange && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
          </div>
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
          {selectedFixtureData.home_score !== null && selectedFixtureData.away_score !== null && (
            <div className="text-sm text-muted-foreground mt-1">
              Database: {selectedFixtureData.home_score} - {selectedFixtureData.away_score}
            </div>
          )}
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
          className={`w-full ${saveConfig.className}`}
          disabled={saveConfig.disabled}
          variant={saveConfig.variant}
        >
          <saveConfig.icon className="h-4 w-4 mr-2" />
          {saveConfig.text}
        </Button>

        {hasScoreChange && (
          <div className="text-xs text-orange-600 text-center bg-orange-50 p-2 rounded border border-orange-200">
            ⚠️ You have unsaved changes. Click "Save Changes" to update the database.
          </div>
        )}

        {isPending && (
          <div className="text-xs text-blue-600 text-center bg-blue-50 p-2 rounded border border-blue-200">
            🔄 Saving match data to database... Please wait.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreManagement;
