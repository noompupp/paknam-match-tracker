import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Smartphone, AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";

interface MatchDataOverviewProps {
  localData: {
    goals: number;
    cards: number;
    playerTimes: number;
    activePlayerCount: number;
    unsyncedPlayerTimes?: number;
    unsyncedGoals?: number;
    unsyncedCards?: number;
  };
  databaseData: {
    goals: number;
    cards: number;
    playerTimes: number;
  };
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  onRefreshData: () => void;
  onSyncData?: () => void;
}

const MatchDataOverview = ({
  localData,
  databaseData,
  hasUnsavedChanges,
  isLoading,
  onRefreshData,
  onSyncData
}: MatchDataOverviewProps) => {
  const dataDiscrepancies = {
    goals: localData.goals !== databaseData.goals,
    cards: localData.cards !== databaseData.cards,
    playerTimes: localData.playerTimes !== databaseData.playerTimes
  };

  const hasDiscrepancies = Object.values(dataDiscrepancies).some(Boolean);
  const totalUnsyncedItems = (localData.unsyncedGoals || 0) + (localData.unsyncedCards || 0) + (localData.unsyncedPlayerTimes || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Match Data Overview</h4>
        <div className="flex gap-2">
          {totalUnsyncedItems > 0 && onSyncData && (
            <Button
              onClick={onSyncData}
              variant="default"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-1" />
              )}
              Sync ({totalUnsyncedItems})
            </Button>
          )}
          <Button
            onClick={onRefreshData}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Comparison Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Local Data */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Local Data</span>
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="text-xs">
                  Unsaved
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Goals/Assists:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{localData.goals}</span>
                  {(localData.unsyncedGoals || 0) > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {localData.unsyncedGoals} unsaved
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Cards:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{localData.cards}</span>
                  {(localData.unsyncedCards || 0) > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {localData.unsyncedCards} unsaved
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Player Times:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{localData.playerTimes}</span>
                  {(localData.unsyncedPlayerTimes || 0) > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {localData.unsyncedPlayerTimes} unsaved
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Active Players:</span>
                <Badge variant="default" className="text-xs">
                  {localData.activePlayerCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Data */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Database</span>
              {isLoading && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Goals/Assists:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{databaseData.goals}</span>
                  {dataDiscrepancies.goals && (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Cards:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{databaseData.cards}</span>
                  {dataDiscrepancies.cards && (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Player Times:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{databaseData.playerTimes}</span>
                  {dataDiscrepancies.playerTimes && (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Synced:</span>
                <Badge variant={hasDiscrepancies || hasUnsavedChanges ? "destructive" : "default"} className="text-xs">
                  {hasDiscrepancies || hasUnsavedChanges ? "No" : "Yes"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Alerts */}
      {hasUnsavedChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 dark:bg-orange-900/10 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-400">
              Unsaved Changes Detected
            </span>
          </div>
          <p className="text-xs text-orange-700 dark:text-orange-500 mt-1">
            Local match data has been modified and needs to be saved to the database.
            {totalUnsyncedItems > 0 && ` ${totalUnsyncedItems} items pending sync.`}
          </p>
        </div>
      )}

      {hasDiscrepancies && !hasUnsavedChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/10 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
              Data Sync Available
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
            Database contains different data. Refresh to see the latest information.
          </p>
        </div>
      )}

      {!hasDiscrepancies && !hasUnsavedChanges && totalUnsyncedItems === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 dark:bg-green-900/10 dark:border-green-800">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-400">
              Data Synchronized
            </span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-500 mt-1">
            All local and database data is synchronized and up to date.
          </p>
        </div>
      )}
    </div>
  );
};

export default MatchDataOverview;
