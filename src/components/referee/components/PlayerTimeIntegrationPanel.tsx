
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Play, Pause, Database } from "lucide-react";
import { useMatchStore } from '@/stores/useMatchStore';
import { useEnhancedMatchSummary } from '@/hooks/useEnhancedMatchSummary';

interface PlayerTimeIntegrationPanelProps {
  selectedFixtureData: any;
  formatTime: (seconds: number) => string;
}

const PlayerTimeIntegrationPanel = ({
  selectedFixtureData,
  formatTime
}: PlayerTimeIntegrationPanelProps) => {
  const { 
    playerTimes, 
    getActivePlayersCount, 
    calculateTotalMinutesPlayed 
  } = useMatchStore();
  
  const { data: enhancedData } = useEnhancedMatchSummary(selectedFixtureData?.id);
  
  const activePlayersCount = getActivePlayersCount();
  const localPlayerTimes = playerTimes || [];
  const databasePlayerTimes = enhancedData?.playerTimes || [];

  // Group local player times by player
  const playerTimesByPlayer = localPlayerTimes.reduce((acc, pt) => {
    if (!acc[pt.playerId]) {
      acc[pt.playerId] = {
        playerId: pt.playerId,
        playerName: pt.playerName,
        teamId: pt.teamId,
        sessions: [],
        totalTime: 0,
        isPlaying: false
      };
    }
    
    acc[pt.playerId].sessions.push(pt);
    acc[pt.playerId].totalTime += pt.totalTime;
    if (pt.isPlaying) {
      acc[pt.playerId].isPlaying = true;
    }
    
    return acc;
  }, {} as Record<number, any>);

  const localPlayersList = Object.values(playerTimesByPlayer);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <h4 className="font-semibold">Player Time Tracking Integration</h4>
      </div>

      {/* Active Tracking Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Play className="h-4 w-4 text-green-600" />
            Active Tracking Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activePlayersCount}</div>
              <div className="text-xs text-muted-foreground">Players Currently Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{localPlayersList.length}</div>
              <div className="text-xs text-muted-foreground">Total Players Tracked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Local Player Times */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Local Player Time Data ({localPlayersList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {localPlayersList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No local player time tracking data
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {localPlayersList.map((player) => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded border"
                >
                  <div>
                    <span className="font-medium text-sm">{player.playerName}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {player.sessions.length} sessions
                      </Badge>
                      {player.isPlaying && (
                        <Badge variant="default" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-medium">
                      {Math.floor(player.totalTime)}min
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Time
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Player Times */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-green-600" />
            Database Player Time Data ({databasePlayerTimes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {databasePlayerTimes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No database player time data found
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {databasePlayerTimes.map((player, index) => (
                <div
                  key={`${player.playerId}-${index}`}
                  className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200 dark:bg-green-900/10 dark:border-green-800"
                >
                  <div>
                    <span className="font-medium text-sm">{player.playerName}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Team {player.team}
                      </Badge>
                      <Badge variant="default" className="text-xs bg-green-600">
                        <Database className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-medium">
                      {Math.floor(player.totalMinutes || 0)}min
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Database Record
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/10 dark:border-blue-800">
        <div className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
          Player Time Integration Status
        </div>
        <div className="text-xs text-blue-700 dark:text-blue-500">
          {localPlayersList.length > 0 && databasePlayerTimes.length > 0
            ? `Both local (${localPlayersList.length}) and database (${databasePlayerTimes.length}) records available`
            : localPlayersList.length > 0
            ? `${localPlayersList.length} local records ready for saving`
            : databasePlayerTimes.length > 0
            ? `${databasePlayerTimes.length} database records available`
            : 'No player time data available'
          }
        </div>
      </div>
    </div>
  );
};

export default PlayerTimeIntegrationPanel;
