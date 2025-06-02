
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Play, Square, RotateCcw } from "lucide-react";
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
  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle>Score Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedFixtureData.home_team?.name}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onRemoveGoal('home')}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold w-8 text-center">{homeScore}</span>
              <Button size="sm" onClick={() => onAddGoal('home')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedFixtureData.away_team?.name}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onRemoveGoal('away')}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold w-8 text-center">{awayScore}</span>
              <Button size="sm" onClick={() => onAddGoal('away')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onToggleTimer} className="flex-1">
            {isRunning ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? 'Stop' : 'Start'}
          </Button>
          <Button variant="outline" onClick={onResetMatch}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        
        <Button 
          onClick={onSaveMatch} 
          className="w-full" 
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Save Match Result'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScoreManagement;
