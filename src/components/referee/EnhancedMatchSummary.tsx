
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Trophy, Database, RefreshCw } from "lucide-react";
import { PlayerTime } from "@/types/database";
import EnhancedMatchHeader from "./components/EnhancedMatchHeader";
import KeyStatistics from "./components/KeyStatistics";
import GoalsAndAssistsSection from "./components/GoalsAndAssistsSection";
import PlayerPerformanceHighlights from "./components/PlayerPerformanceHighlights";
import DisciplinaryActionsSection from "./components/DisciplinaryActionsSection";
import EnhancedPlayerTimeSummary from "./components/EnhancedPlayerTimeSummary";
import MatchEventsTimeline from "./components/MatchEventsTimeline";
import EnhancedMatchEventsTimeline from "./components/EnhancedMatchEventsTimeline";
import { useEnhancedMatchSummary } from '@/hooks/useEnhancedMatchSummary';
import { useResetState } from '@/hooks/useResetState';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedMatchSummaryProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  events: any[];
  goals: any[];
  cards: any[];
  trackedPlayers: PlayerTime[];
  allPlayers: any[];
  onExportSummary: () => void;
  formatTime: (seconds: number) => string;
  resetState?: {
    shouldUseLocalState: () => boolean;
    isInFreshResetState: () => boolean;
    lastResetTimestamp: string | null;
  };
}

const EnhancedMatchSummary = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  events,
  goals,
  cards,
  trackedPlayers,
  allPlayers,
  onExportSummary,
  formatTime,
  resetState
}: EnhancedMatchSummaryProps) => {

  // Use the enhanced match summary service
  const { data: enhancedData, isLoading, isSuccess } = useEnhancedMatchSummary(selectedFixtureData?.id);
  
  // Use local reset state if not provided
  const localResetState = useResetState({ fixtureId: selectedFixtureData?.id });
  const activeResetState = resetState || localResetState;

  // Enhanced data prioritization logic
  const shouldUseLocalState = activeResetState.shouldUseLocalState();
  const isInFreshResetState = activeResetState.isInFreshResetState();
  
  console.log('📊 EnhancedMatchSummary: Data prioritization decision:', {
    fixture: selectedFixtureData?.id,
    shouldUseLocalState,
    isInFreshResetState,
    hasEnhancedData: !!enhancedData,
    enhancedDataSuccess: isSuccess,
    lastResetTimestamp: activeResetState.lastResetTimestamp
  });

  // Use enhanced data when available, BUT prioritize local data immediately after reset
  const shouldUseEnhancedData = isSuccess && enhancedData && !shouldUseLocalState;
  
  const displayData = shouldUseEnhancedData ? {
    goals: enhancedData.goals,
    cards: enhancedData.cards,
    trackedPlayers: enhancedData.playerTimes,
    homeScore: enhancedData.summary.homeTeamGoals,
    awayScore: enhancedData.summary.awayTeamGoals,
    timelineEvents: enhancedData.timelineEvents || []
  } : {
    goals,
    cards,
    trackedPlayers,
    homeScore,
    awayScore,
    timelineEvents: []
  };

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Enhanced Match Summary
          {shouldUseEnhancedData && (
            <Database className="h-4 w-4 text-green-600" />
          )}
          {isInFreshResetState && (
            <RefreshCw className="h-4 w-4 text-blue-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Service Status */}
        {shouldUseEnhancedData && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Enhanced data service active - displaying comprehensive match analytics from optimized database queries.
            </AlertDescription>
          </Alert>
        )}

        {/* Fresh Reset State Indicator */}
        {isInFreshResetState && (
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              Match data recently reset - displaying fresh local state. Database sync will update automatically.
            </AlertDescription>
          </Alert>
        )}

        {/* Match Result */}
        <EnhancedMatchHeader
          selectedFixtureData={selectedFixtureData}
          homeScore={displayData.homeScore}
          awayScore={displayData.awayScore}
          matchTime={matchTime}
          trackedPlayers={displayData.trackedPlayers}
          formatTime={formatTime}
        />

        <Separator />

        {/* Key Statistics Dashboard */}
        <KeyStatistics
          events={events}
          goals={displayData.goals}
          cards={displayData.cards}
          trackedPlayers={displayData.trackedPlayers}
        />

        <Separator />

        {/* Goals & Assists Summary */}
        <GoalsAndAssistsSection
          selectedFixtureData={selectedFixtureData}
          goals={displayData.goals}
          allPlayers={allPlayers}
          formatTime={formatTime}
        />

        <Separator />

        {/* Player Performance Highlights */}
        <PlayerPerformanceHighlights
          trackedPlayers={displayData.trackedPlayers}
          formatTime={formatTime}
        />

        {displayData.trackedPlayers.length > 0 && <Separator />}

        {/* Cards Summary */}
        <DisciplinaryActionsSection
          selectedFixtureData={selectedFixtureData}
          cards={displayData.cards}
          formatTime={formatTime}
        />

        <Separator />

        {/* Player Time Summary */}
        <EnhancedPlayerTimeSummary
          trackedPlayers={displayData.trackedPlayers}
          allPlayers={allPlayers}
          matchTime={matchTime}
          formatTime={formatTime}
        />

        <Separator />

        {/* Enhanced Match Events Timeline */}
        {shouldUseEnhancedData && enhancedData.timelineEvents && enhancedData.timelineEvents.length > 0 ? (
          <EnhancedMatchEventsTimeline
            timelineEvents={enhancedData.timelineEvents}
            formatTime={formatTime}
          />
        ) : (
          <MatchEventsTimeline
            events={events}
            formatTime={formatTime}
          />
        )}

        {/* Export Button */}
        <Button onClick={onExportSummary} className="w-full" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Enhanced Match Summary
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedMatchSummary;
