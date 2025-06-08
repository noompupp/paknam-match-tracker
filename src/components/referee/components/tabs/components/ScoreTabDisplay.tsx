
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ScoreTabDisplayProps {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  hasUnsavedChanges: boolean;
  formatTime: (seconds: number) => string;
}

const ScoreTabDisplay = ({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  matchTime,
  isRunning,
  hasUnsavedChanges,
  formatTime
}: ScoreTabDisplayProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">{homeTeamName}</h3>
            <div className="text-5xl font-bold text-primary">{homeScore}</div>
          </div>
          
          <div className="text-center px-6">
            <div className="text-2xl font-bold text-muted-foreground mb-2">VS</div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-lg font-mono">{formatTime(matchTime)}</span>
            </div>
            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm ${
              isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              {isRunning ? 'Live' : 'Paused'}
            </div>
            {hasUnsavedChanges && (
              <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Auto-save enabled • Changes pending
              </div>
            )}
          </div>
          
          <div className="text-center flex-1">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">{awayTeamName}</h3>
            <div className="text-5xl font-bold text-primary">{awayScore}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreTabDisplay;
