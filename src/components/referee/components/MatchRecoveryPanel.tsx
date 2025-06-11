
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { History, Eye, RefreshCw, Play, Clock, Trophy, Users, AlertCircle } from "lucide-react";
import { useEnhancedMatchSummary } from '@/hooks/useEnhancedMatchSummary';
import { useMatchStore } from '@/stores/useMatchStore';

interface MatchRecoveryPanelProps {
  fixtures: any[];
  onResumeMatch: (fixtureId: number) => void;
  onViewMatch: (fixtureId: number) => void;
}

const MatchRecoveryPanel = ({
  fixtures,
  onResumeMatch,
  onViewMatch
}: MatchRecoveryPanelProps) => {
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const { data: matchData, isLoading, refetch } = useEnhancedMatchSummary(selectedFixtureId);
  const { setFixtureId, loadPlayerTimesFromDatabase } = useMatchStore();

  // Filter fixtures that have match data (completed or in-progress matches)
  const completedFixtures = fixtures.filter(fixture => 
    fixture.home_score !== null || fixture.away_score !== null
  );

  const handleResumeMatch = async (fixtureId: number) => {
    try {
      console.log('🔄 Resuming match:', fixtureId);
      setFixtureId(fixtureId);
      await loadPlayerTimesFromDatabase(fixtureId);
      onResumeMatch(fixtureId);
    } catch (error) {
      console.error('❌ Error resuming match:', error);
    }
  };

  const handleViewMatch = (fixtureId: number) => {
    setSelectedFixtureId(fixtureId);
    onViewMatch(fixtureId);
  };

  const formatMatchStatus = (fixture: any) => {
    const hasScore = fixture.home_score !== null || fixture.away_score !== null;
    const isCompleted = hasScore && (fixture.status === 'completed' || fixture.status === 'finished');
    
    if (isCompleted) return 'Completed';
    if (hasScore) return 'In Progress';
    return 'Scheduled';
  };

  const getStatusVariant = (fixture: any) => {
    const status = formatMatchStatus(fixture);
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Match Recovery & Review
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Resume or review completed matches
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {completedFixtures.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Match Data Found</h3>
            <p className="text-muted-foreground text-sm">
              No completed or in-progress matches available for recovery
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4" />
              <span className="font-medium text-sm">Available Matches ({completedFixtures.length})</span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {completedFixtures.map((fixture) => (
                <Card key={fixture.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {fixture.home_team?.name || 'Home'} vs {fixture.away_team?.name || 'Away'}
                          </span>
                          <Badge variant={getStatusVariant(fixture)} className="text-xs">
                            {formatMatchStatus(fixture)}
                          </Badge>
                        </div>
                        
                        {(fixture.home_score !== null || fixture.away_score !== null) && (
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Score: {fixture.home_score || 0} - {fixture.away_score || 0}</span>
                            <span>#{fixture.id}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleResumeMatch(fixture.id)}
                        size="sm"
                        className="flex-1"
                        variant="default"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                      
                      <Button
                        onClick={() => handleViewMatch(fixture.id)}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedFixtureId && matchData && (
          <>
            <Separator />
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" />
                Match Summary (Fixture #{selectedFixtureId})
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Goals/Assists:</span>
                  <span className="font-medium ml-2">{matchData.goals.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cards:</span>
                  <span className="font-medium ml-2">{matchData.cards.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Player Times:</span>
                  <span className="font-medium ml-2">{matchData.playerTimes.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Events:</span>
                  <span className="font-medium ml-2">{matchData.goals.length + matchData.cards.length}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/10 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
            Match Recovery Status
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-500">
            {completedFixtures.length > 0
              ? `${completedFixtures.length} matches available for recovery and review`
              : 'No matches with data available for recovery'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchRecoveryPanel;
