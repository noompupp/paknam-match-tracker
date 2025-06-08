
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Save, RotateCcw } from "lucide-react";

interface MatchControlsSectionProps {
  isRunning: boolean;
  onToggleTimer: () => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
}

const MatchControlsSection = ({
  isRunning,
  onToggleTimer,
  onSaveMatch,
  onResetMatch
}: MatchControlsSectionProps) => {
  return (
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
  );
};

export default MatchControlsSection;
