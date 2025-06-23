
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useMatchStore } from "@/stores/useMatchStore";
import { useRealTimeScoreSync } from "@/hooks/useRealTimeScoreSync";

interface ScoreDisplayProps {
  selectedFixtureData: any;
  showLocal?: boolean;
  showControls?: boolean;
}

const ScoreDisplay = ({ 
  selectedFixtureData, 
  showLocal = false, 
  showControls = true 
}: ScoreDisplayProps) => {
  const { homeScore, awayScore } = useMatchStore();
  const { 
    syncScores, 
    forceScoreUpdate, 
    isLoading, 
    lastSyncTime, 
    hasSyncErrors 
  } = useRealTimeScoreSync({
    fixtureId: selectedFixtureData?.id,
    autoSync: false // Manual sync for better control
  });

  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          No fixture selected
        </CardContent>
      </Card>
    );
  }

  const handleManualSync = async () => {
    await syncScores(true);
  };

  const handleForceUpdate = async () => {
    await forceScoreUpdate();
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Score Display */}
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {selectedFixtureData.home_team?.name || 'Home Team'}
              </h3>
              <div className="text-4xl font-bold text-primary">
                {showLocal ? homeScore : (selectedFixtureData.home_score ?? homeScore)}
              </div>
            </div>
            
            <div className="mx-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground mb-1">VS</div>
              {hasSyncErrors && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Sync Issue
                </Badge>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {selectedFixtureData.away_team?.name || 'Away Team'}
              </h3>
              <div className="text-4xl font-bold text-primary">
                {showLocal ? awayScore : (selectedFixtureData.away_score ?? awayScore)}
              </div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="text-center space-y-2">
            <div className="text-xs text-muted-foreground">
              {showLocal ? 'Local Score (from goal events)' : 'Database Score (real-time synced)'}
            </div>
            
            {lastSyncTime && (
              <div className="text-xs text-muted-foreground">
                Last synced: {lastSyncTime.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Control Buttons */}
          {showControls && (
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Scores
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceUpdate}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Force Update
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreDisplay;
