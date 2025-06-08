
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

interface SimplifiedGoalRecordingProps {
  homeTeamName: string;
  awayTeamName: string;
  onRecordGoal: () => void;
  isDisabled?: boolean;
}

const SimplifiedGoalRecording = ({
  homeTeamName,
  awayTeamName,
  onRecordGoal,
  isDisabled = false
}: SimplifiedGoalRecordingProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Goal Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Record a goal with complete player details and timing information
          </p>
          
          <Button
            onClick={onRecordGoal}
            disabled={isDisabled}
            className="w-full h-16 text-lg"
            size="lg"
          >
            <Target className="h-5 w-5 mr-2" />
            Record Goal
          </Button>
          
          <div className="mt-3 text-xs text-muted-foreground bg-blue-50 px-3 py-2 rounded-lg">
            🎯 <strong>Complete recording</strong> - Player names, assists, cards, and timing
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <h4 className="font-medium text-sm text-muted-foreground">{homeTeamName}</h4>
          </div>
          <div className="text-center">
            <h4 className="font-medium text-sm text-muted-foreground">{awayTeamName}</h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedGoalRecording;
