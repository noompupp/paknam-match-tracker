
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, RefreshCw, AlertTriangle, WifiOff } from "lucide-react";
import { useMatchStore } from "@/stores/useMatchStore";

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

const SyncStatusIndicator = ({ 
  showDetails = false, 
  className = "" 
}: SyncStatusIndicatorProps) => {
  const { 
    isSyncing, 
    lastSyncTimestamp, 
    syncErrors, 
    isAutoSyncEnabled,
    hasUnsavedChanges 
  } = useMatchStore();

  const getSyncStatus = () => {
    if (!navigator.onLine) {
      return {
        status: 'offline',
        icon: WifiOff,
        text: 'Offline',
        variant: 'secondary' as const,
        color: 'text-gray-500'
      };
    }

    if (isSyncing) {
      return {
        status: 'syncing',
        icon: RefreshCw,
        text: 'Syncing...',
        variant: 'default' as const,
        color: 'text-blue-600',
        animate: true
      };
    }

    if (syncErrors.length > 0) {
      return {
        status: 'error',
        icon: AlertTriangle,
        text: `Sync Error`,
        variant: 'destructive' as const,
        color: 'text-red-600'
      };
    }

    if (hasUnsavedChanges && isAutoSyncEnabled) {
      return {
        status: 'pending',
        icon: RefreshCw,
        text: 'Sync Pending',
        variant: 'secondary' as const,
        color: 'text-yellow-600'
      };
    }

    if (lastSyncTimestamp) {
      return {
        status: 'synced',
        icon: CheckCircle,
        text: 'Synced',
        variant: 'default' as const,
        color: 'text-green-600'
      };
    }

    return {
      status: 'unknown',
      icon: AlertTriangle,
      text: 'Not Synced',
      variant: 'outline' as const,
      color: 'text-gray-500'
    };
  };

  const statusInfo = getSyncStatus();
  const Icon = statusInfo.icon;

  const formatLastSync = () => {
    if (!lastSyncTimestamp) return 'Never';
    const diff = Date.now() - lastSyncTimestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={statusInfo.variant} className="flex items-center gap-1 text-xs">
        <Icon 
          className={`h-3 w-3 ${statusInfo.color} ${statusInfo.animate ? 'animate-spin' : ''}`} 
        />
        {statusInfo.text}
        {!isAutoSyncEnabled && (
          <span className="text-xs opacity-70">(Manual)</span>
        )}
      </Badge>

      {showDetails && (
        <div className="text-xs text-muted-foreground">
          Last sync: {formatLastSync()}
          {syncErrors.length > 0 && (
            <div className="text-red-500 mt-1">
              Error: {syncErrors[syncErrors.length - 1]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
