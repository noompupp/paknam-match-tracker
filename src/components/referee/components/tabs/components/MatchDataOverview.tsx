
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Smartphone, AlertTriangle, RefreshCw } from "lucide-react";

interface MatchDataOverviewProps {
  localData: {
    goals: number;
    cards: number;
    playerTimes: number;
    activePlayerCount: number;
  };
  databaseData: {
    goals: number;
    cards: number;
    playerTimes: number;
  };
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  onRefreshData: () => void;
}

const MatchDataOverview = ({
  localData,
  databaseData,
  hasUnsavedChanges,
  isLoading,
  onRefreshData
}: MatchDataOverviewProps) => {
  const dataDiscrepancies = {
    goals: localData.goals !== databaseData.goals,
    cards: localData.cards !== databaseData.cards,
    playerTimes: localData.playerTimes !== databaseData.playerTimes
  };

  const hasDiscrepancies = Object.values(dataDiscrepancies).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Match Data Overview</h4>
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
                <span className="font-medium">{localData.goals}</span>
              </div>
              <div className="flex justify-between">
                <span>Cards:</span>
                <span className="font-medium">{localData.cards}</span>
              </div>
              <div className="flex justify-between">
                <span>Player Times:</span>
                <span className="font-medium">{localData.playerTimes}</span>
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
                <Badge variant={hasDiscrepancies ? "destructive" : "default"} className="text-xs">
                  {hasDiscrepancies ? "No" : "Yes"}
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
    </div>
  );
};

export default MatchDataOverview;
