
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlayerStatsSync } from "@/hooks/usePlayerStatsSync";
import { Database, TestTube, RefreshCw } from "lucide-react";

const StatsSync = () => {
  const { syncStats, validateStats, isSyncing, isValidating, lastSyncResult } = usePlayerStatsSync();

  const handleSyncStats = () => {
    syncStats();
  };

  const handleValidateStats = () => {
    validateStats();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Player Statistics Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Sync Player Stats with Match Events</h3>
          <p className="text-sm text-gray-600 mb-4">
            Synchronize player statistics (goals and assists) with recorded match events. 
            This ensures that Top Scorers and Top Assists display correctly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleSyncStats}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {isSyncing ? "Syncing..." : "Sync Player Stats"}
            </Button>
            
            <Button 
              onClick={handleValidateStats}
              disabled={isValidating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isValidating ? "Validating..." : "Validate Stats"}
            </Button>
          </div>
          
          {lastSyncResult && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Last Sync Result:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <Badge variant="outline">{lastSyncResult.playersUpdated}</Badge>
                  <p className="text-blue-800 mt-1">Players Updated</p>
                </div>
                <div className="text-center">
                  <Badge className="bg-green-600">{lastSyncResult.goalsAdded}</Badge>
                  <p className="text-blue-800 mt-1">Goals Added</p>
                </div>
                <div className="text-center">
                  <Badge className="bg-blue-600">{lastSyncResult.assistsAdded}</Badge>
                  <p className="text-blue-800 mt-1">Assists Added</p>
                </div>
              </div>
              {lastSyncResult.errors.length > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Errors: {lastSyncResult.errors.length} (check console for details)
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsSync;
