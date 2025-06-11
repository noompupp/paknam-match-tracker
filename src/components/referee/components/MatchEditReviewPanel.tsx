
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Eye, Clock, Trophy, Users, AlertCircle, Save, RefreshCw } from "lucide-react";
import { useEnhancedMatchSummary } from '@/hooks/useEnhancedMatchSummary';
import { useMatchStore } from '@/stores/useMatchStore';
import MatchDataOverview from './tabs/components/MatchDataOverview';
import PlayerTimeIntegrationPanel from './PlayerTimeIntegrationPanel';

interface MatchEditReviewPanelProps {
  selectedFixtureData: any;
  onEditMatch: () => void;
  onViewSummary: () => void;
  formatTime: (seconds: number) => string;
}

const MatchEditReviewPanel = ({
  selectedFixtureData,
  onEditMatch,
  onViewSummary,
  formatTime
}: MatchEditReviewPanelProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'review'>('overview');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get enhanced match data
  const { data: enhancedData, isLoading, refetch } = useEnhancedMatchSummary(selectedFixtureData?.id);
  
  // Get current match store state
  const { 
    homeScore, 
    awayScore, 
    goals, 
    cards, 
    playerTimes,
    hasUnsavedChanges,
    getActivePlayersCount,
    getUnsavedItemsCount,
    loadPlayerTimesFromDatabase,
    syncPlayerTimesToDatabase,
    setFixtureId
  } = useMatchStore();

  // Initialize match store when fixture changes
  useEffect(() => {
    if (selectedFixtureData?.id && !isInitialized) {
      console.log('🔄 Initializing match store for fixture:', selectedFixtureData.id);
      setFixtureId(selectedFixtureData.id);
      
      // Load existing player times from database
      loadPlayerTimesFromDatabase(selectedFixtureData.id)
        .then(() => {
          setIsInitialized(true);
          console.log('✅ Match store initialized with database data');
        })
        .catch((error) => {
          console.error('❌ Error initializing match store:', error);
          setIsInitialized(true); // Continue even if loading fails
        });
    } else if (!selectedFixtureData?.id) {
      setIsInitialized(false);
    }
  }, [selectedFixtureData?.id, setFixtureId, loadPlayerTimesFromDatabase, isInitialized]);

  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Match Selected</h3>
            <p className="text-muted-foreground">Select a fixture to edit and review match data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const homeTeamName = selectedFixtureData.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData.away_team?.name || 'Away Team';

  // Calculate match statistics
  const localGoalsCount = goals.length;
  const localCardsCount = cards.length;
  const localPlayerTimesCount = playerTimes.length;
  const activePlayersCount = getActivePlayersCount();
  const unsavedCounts = getUnsavedItemsCount();

  const databaseGoalsCount = enhancedData?.goals.length || 0;
  const databaseCardsCount = enhancedData?.cards.length || 0;
  const databasePlayerTimesCount = enhancedData?.playerTimes.length || 0;

  const handleRefreshData = async () => {
    await refetch();
    if (selectedFixtureData?.id) {
      await loadPlayerTimesFromDatabase(selectedFixtureData.id);
    }
  };

  const handleSyncData = async () => {
    if (!selectedFixtureData?.id) return;
    
    try {
      await syncPlayerTimesToDatabase(selectedFixtureData.id);
      await refetch();
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Match Edit & Review Panel
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {homeTeamName} vs {awayTeamName}
          </p>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              <Trophy className="h-4 w-4 mr-1" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'tracking' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('tracking')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Tracking
            </Button>
            <Button
              variant={activeTab === 'review' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('review')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Review
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Score Display */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">{homeTeamName}</div>
              <div className="text-2xl font-bold">{homeScore}</div>
            </div>
            <div className="text-lg font-medium text-muted-foreground">vs</div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">{awayTeamName}</div>
              <div className="text-2xl font-bold">{awayScore}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Loading State */}
        {!isInitialized && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Initializing match data...</p>
          </div>
        )}

        {/* Tab Content */}
        {isInitialized && (
          <>
            {activeTab === 'overview' && (
              <MatchDataOverview
                localData={{
                  goals: localGoalsCount,
                  cards: localCardsCount,
                  playerTimes: localPlayerTimesCount,
                  activePlayerCount: activePlayersCount,
                  unsyncedGoals: unsavedCounts.goals,
                  unsyncedCards: unsavedCounts.cards,
                  unsyncedPlayerTimes: unsavedCounts.playerTimes
                }}
                databaseData={{
                  goals: databaseGoalsCount,
                  cards: databaseCardsCount,
                  playerTimes: databasePlayerTimesCount
                }}
                hasUnsavedChanges={hasUnsavedChanges}
                isLoading={isLoading}
                onRefreshData={handleRefreshData}
                onSyncData={handleSyncData}
              />
            )}

            {activeTab === 'tracking' && (
              <PlayerTimeIntegrationPanel
                selectedFixtureData={selectedFixtureData}
                formatTime={formatTime}
              />
            )}

            {activeTab === 'review' && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Match Review Actions
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button onClick={onEditMatch} className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Match Details
                  </Button>
                  
                  <Button onClick={onViewSummary} variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Complete Summary
                  </Button>
                  
                  <Button onClick={handleRefreshData} variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Database Data
                  </Button>
                </div>

                {enhancedData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 dark:bg-green-900/10 dark:border-green-800">
                    <div className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">
                      Database Summary Available
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-500">
                      Enhanced match data loaded with {enhancedData.goals.length} goals/assists, 
                      {enhancedData.cards.length} cards, and {enhancedData.playerTimes.length} player time records.
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <Separator />

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={onEditMatch} 
            size="sm" 
            className="flex-1"
            disabled={!selectedFixtureData || !isInitialized}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Match
          </Button>
          
          <Button 
            onClick={onViewSummary} 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={!selectedFixtureData || !isInitialized}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchEditReviewPanel;
