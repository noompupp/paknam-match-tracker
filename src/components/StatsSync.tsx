
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePlayerStatsSync } from "@/hooks/usePlayerStatsSync";
import { Database, TestTube, RefreshCw, Trash2, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useState } from "react";

const StatsSync = () => {
  const { 
    syncStats, 
    validateStats, 
    cleanupDuplicates, 
    isSyncing, 
    isValidating, 
    isCleaningUp, 
    lastSyncResult, 
    lastValidationResult,
    lastCleanupResult 
  } = usePlayerStatsSync();
  const [showDetails, setShowDetails] = useState(false);

  const handleSyncStats = () => {
    syncStats();
  };

  const handleValidateStats = () => {
    validateStats();
  };

  const handleCleanupDuplicates = () => {
    cleanupDuplicates();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Player Statistics Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phase 1: Player Stats Sync */}
        <div>
          <h3 className="font-semibold mb-3">Phase 1: Player Stats Synchronization</h3>
          <p className="text-sm text-gray-600 mb-4">
            Synchronize player statistics (goals and assists) with recorded match events. 
            This ensures that Top Scorers and Top Assists display correctly on the Dashboard.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Button 
              onClick={handleValidateStats}
              disabled={isValidating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isValidating ? "Validating..." : "1. Validate Stats"}
            </Button>
            
            <Button 
              onClick={handleSyncStats}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {isSyncing ? "Syncing..." : "2. Sync Player Stats"}
            </Button>

            <Button 
              onClick={handleCleanupDuplicates}
              disabled={isCleaningUp}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isCleaningUp ? "Cleaning..." : "3. Cleanup Duplicates"}
            </Button>
          </div>

          {/* Validation Results */}
          {lastValidationResult && (
            <Alert className={lastValidationResult.isValid ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {lastValidationResult.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    <strong>
                      Validation {lastValidationResult.isValid ? "Passed" : "Found Issues"}
                    </strong>
                  </div>
                  
                  {lastValidationResult.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <Badge variant="outline">{lastValidationResult.summary.totalMembers}</Badge>
                        <p className="text-gray-600">Total Players</p>
                      </div>
                      <div>
                        <Badge variant="outline">{lastValidationResult.summary.membersWithGoals}</Badge>
                        <p className="text-gray-600">With Goals</p>
                      </div>
                      <div>
                        <Badge variant="outline">{lastValidationResult.summary.membersWithAssists}</Badge>
                        <p className="text-gray-600">With Assists</p>
                      </div>
                      <div>
                        <Badge variant={lastValidationResult.summary.unassignedGoalEvents > 0 ? "destructive" : "default"}>
                          {lastValidationResult.summary.unassignedGoalEvents}
                        </Badge>
                        <p className="text-gray-600">Unassigned Goals</p>
                      </div>
                    </div>
                  )}
                  
                  {!lastValidationResult.isValid && lastValidationResult.issues.length > 0 && (
                    <div className="mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs"
                      >
                        {showDetails ? "Hide" : "Show"} Issues ({lastValidationResult.issues.length})
                      </Button>
                      {showDetails && (
                        <ul className="list-disc list-inside text-xs text-gray-600 mt-2 space-y-1">
                          {lastValidationResult.issues.slice(0, 10).map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                          {lastValidationResult.issues.length > 10 && (
                            <li className="text-gray-500">
                              ... and {lastValidationResult.issues.length - 10} more issues
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Sync Results */}
          {lastSyncResult && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Sync Results:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <div className="text-center">
                  <Badge variant={lastSyncResult.errors.length > 0 ? "destructive" : "default"}>
                    {lastSyncResult.errors.length}
                  </Badge>
                  <p className="text-blue-800 mt-1">Errors</p>
                </div>
              </div>
              
              {lastSyncResult.details && (
                <div className="mt-3 text-xs text-blue-700">
                  <p>• Processed {lastSyncResult.details.goalEvents} goal events and {lastSyncResult.details.assistEvents} assist events</p>
                  {lastSyncResult.details.playersWithoutMatch.length > 0 && (
                    <p>• Players not found in database: {lastSyncResult.details.playersWithoutMatch.slice(0, 3).join(", ")}
                      {lastSyncResult.details.playersWithoutMatch.length > 3 && ` (and ${lastSyncResult.details.playersWithoutMatch.length - 3} more)`}
                    </p>
                  )}
                </div>
              )}
              
              {lastSyncResult.warnings && lastSyncResult.warnings.length > 0 && (
                <Alert className="mt-3 border-yellow-500 bg-yellow-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium text-yellow-800">Warnings:</p>
                    <ul className="list-disc list-inside text-xs text-yellow-700 mt-1">
                      {lastSyncResult.warnings.slice(0, 3).map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                      {lastSyncResult.warnings.length > 3 && (
                        <li>... and {lastSyncResult.warnings.length - 3} more warnings</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {lastSyncResult.errors.length > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Errors: {lastSyncResult.errors.length} (check console for details)
                </p>
              )}
            </div>
          )}

          {/* Cleanup Results */}
          {lastCleanupResult && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Cleanup Results:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <Badge className="bg-purple-600">{lastCleanupResult.removedEvents}</Badge>
                  <p className="text-purple-800 mt-1">Duplicate Events Removed</p>
                </div>
                <div className="text-center">
                  <Badge variant={lastCleanupResult.errors.length > 0 ? "destructive" : "default"}>
                    {lastCleanupResult.errors.length}
                  </Badge>
                  <p className="text-purple-800 mt-1">Errors</p>
                </div>
              </div>
              {lastCleanupResult.errors.length > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Cleanup Errors: {lastCleanupResult.errors.length} (check console for details)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            How to Use:
          </h4>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
            <li><strong>Validate Stats:</strong> Check current consistency between player stats and match events</li>
            <li><strong>Sync Player Stats:</strong> Update player goals/assists based on assigned match events</li>
            <li><strong>Cleanup Duplicates:</strong> Remove duplicate "Unknown Player" events when assigned events exist</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            💡 Run validation first to see what needs to be fixed, then sync stats, and finally cleanup duplicates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsSync;
