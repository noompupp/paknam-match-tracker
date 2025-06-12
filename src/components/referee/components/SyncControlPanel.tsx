
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  RefreshCw, 
  Cloud, 
  CloudOff, 
  Clock, 
  Users, 
  Database,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface SyncControlPanelProps {
  syncStatus: {
    lastSyncTime: number | null;
    pendingChanges: number;
    isSyncing: boolean;
    lastError: string | null;
  };
  autoSyncEnabled: boolean;
  manualSyncOnly: boolean;
  activePlayersCount: number;
  syncRecommendation: string;
  onForceSync: () => void;
  onToggleAutoSync: (enabled: boolean) => void;
  onEnableManualOnly: () => void;
  onClearPending: () => void;
}

const SyncControlPanel = ({
  syncStatus,
  autoSyncEnabled,
  manualSyncOnly,
  activePlayersCount,
  syncRecommendation,
  onForceSync,
  onToggleAutoSync,
  onEnableManualOnly,
  onClearPending
}: SyncControlPanelProps) => {
  const formatLastSyncTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getSyncStatusColor = () => {
    if (syncStatus.lastError) return 'destructive';
    if (syncStatus.isSyncing) return 'default';
    if (syncStatus.pendingChanges > 0) return 'secondary';
    return 'outline';
  };

  const getSyncStatusIcon = () => {
    if (syncStatus.lastError) return <AlertCircle className="h-4 w-4" />;
    if (syncStatus.isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (syncStatus.pendingChanges > 0) return <Cloud className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Database Sync Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getSyncStatusColor()} className="flex items-center gap-1">
              {getSyncStatusIcon()}
              {syncStatus.isSyncing ? 'Syncing...' : 'Sync Status'}
            </Badge>
            {syncStatus.pendingChanges > 0 && (
              <Badge variant="outline" className="text-xs">
                {syncStatus.pendingChanges} pending
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Last: {formatLastSyncTime(syncStatus.lastSyncTime)}
          </div>
        </div>

        {/* Error Display */}
        {syncStatus.lastError && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            Error: {syncStatus.lastError}
          </div>
        )}

        {/* Active Players & Recommendation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>Active Players: {activePlayersCount}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {syncRecommendation}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {autoSyncEnabled ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
              <span className="text-sm">Auto-sync</span>
            </div>
            <Switch
              checked={autoSyncEnabled}
              onCheckedChange={onToggleAutoSync}
              disabled={manualSyncOnly}
            />
          </div>

          {/* Manual Sync Only */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Manual only</span>
            </div>
            <Switch
              checked={manualSyncOnly}
              onCheckedChange={(checked) => {
                if (checked) onEnableManualOnly();
                else onToggleAutoSync(true);
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onForceSync}
            disabled={syncStatus.isSyncing || syncStatus.pendingChanges === 0}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Now
          </Button>
          
          {syncStatus.pendingChanges > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClearPending}
              disabled={syncStatus.isSyncing}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Performance Info */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Optimized sync: {autoSyncEnabled ? '30s intervals' : 'Manual only'} • 
          Reduces API calls by ~80%
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncControlPanel;
