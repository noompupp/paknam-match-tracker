
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, AlertTriangle } from "lucide-react";
import { useDataSynchronization } from "@/hooks/useDataSynchronization";
import { useState } from "react";

const DataSyncButton = () => {
  const { performFullSync, isSyncing, lastSyncResult } = useDataSynchronization();
  const [showDetails, setShowDetails] = useState(false);

  const handleSync = () => {
    performFullSync();
  };

  const getSyncStatusColor = () => {
    if (!lastSyncResult) return 'default';
    if (lastSyncResult.success && lastSyncResult.errors.length === 0) return 'default';
    if (lastSyncResult.success && lastSyncResult.errors.length > 0) return 'secondary';
    return 'destructive';
  };

  const getSyncStatusText = () => {
    if (!lastSyncResult) return 'Never synced';
    if (lastSyncResult.success && lastSyncResult.errors.length === 0) return 'Last sync: Success';
    if (lastSyncResult.success && lastSyncResult.errors.length > 0) return 'Last sync: Warnings';
    return 'Last sync: Failed';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleSync}
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Database className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing Data...' : 'Sync All Data'}
        </Button>
        
        {lastSyncResult && (
          <Badge 
            variant={getSyncStatusColor()}
            className="cursor-pointer"
            onClick={() => setShowDetails(!showDetails)}
          >
            {getSyncStatusText()}
            {lastSyncResult.errors.length > 0 && (
              <AlertTriangle className="h-3 w-3 ml-1" />
            )}
          </Badge>
        )}
      </div>

      {showDetails && lastSyncResult && (
        <div className="bg-gray-50 border rounded-lg p-3 text-sm">
          <h4 className="font-semibold mb-2">Last Sync Results:</h4>
          <div className="space-y-1">
            <div>Players Updated: {lastSyncResult.playersUpdated}</div>
            <div>Goals Added: {lastSyncResult.goalsAdded}</div>
            <div>Assists Added: {lastSyncResult.assistsAdded}</div>
            {lastSyncResult.errors.length > 0 && (
              <div className="text-red-600">
                Errors: {lastSyncResult.errors.length}
              </div>
            )}
            {lastSyncResult.warnings.length > 0 && (
              <div className="text-yellow-600">
                Warnings: {lastSyncResult.warnings.length}
              </div>
            )}
          </div>
          <p className="mt-2 text-gray-600">{lastSyncResult.summary}</p>
        </div>
      )}
    </div>
  );
};

export default DataSyncButton;
