
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { usePlayerStatsSync } from "@/hooks/usePlayerStatsSync";

const StatsManagement = () => {
  const { syncStats, validateStats, isSyncing, isValidating, lastSyncResult } = usePlayerStatsSync();

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Statistics Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={() => syncStats()} 
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Player Stats'}
          </Button>

          <Button 
            onClick={() => validateStats()} 
            disabled={isValidating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'Validating...' : 'Validate Stats'}
          </Button>
        </div>

        {lastSyncResult && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Last Sync Result</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="text-center">
                  <Badge variant="default">
                    Players: {lastSyncResult.playersUpdated}
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline">
                    Goals: +{lastSyncResult.goalsAdded}
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline">
                    Assists: +{lastSyncResult.assistsAdded}
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={lastSyncResult.errors.length > 0 ? "destructive" : "secondary"}>
                    Errors: {lastSyncResult.errors.length}
                  </Badge>
                </div>
              </div>
              
              {lastSyncResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Sync Warnings:</p>
                      <ul className="text-xs text-red-700 mt-1 space-y-1">
                        {lastSyncResult.errors.map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />
        
        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Sync Player Stats:</strong> Updates member statistics based on assigned match events (goals/assists).</p>
          <p><strong>Validate Stats:</strong> Checks consistency between match events and member statistics.</p>
          <p><strong>Note:</strong> Run sync after assigning goals to players to update their statistics.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsManagement;
