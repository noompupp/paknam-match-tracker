
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Trophy, Database } from "lucide-react";
import { PlayerTime } from "@/types/database";
import EnhancedMatchHeader from "./components/EnhancedMatchHeader";
import KeyStatistics from "./components/KeyStatistics";
import GoalsAndAssistsSection from "./components/GoalsAndAssistsSection";
import PlayerPerformanceHighlights from "./components/PlayerPerformanceHighlights";
import DisciplinaryActionsSection from "./components/DisciplinaryActionsSection";
import EnhancedPlayerTimeSummary from "./components/EnhancedPlayerTimeSummary";
import MatchEventsTimeline from "./components/MatchEventsTimeline";
import { useEnhancedMatchSummary } from '@/hooks/useEnhancedMatchSummary';
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
  formatTime
}: EnhancedMatchSummaryProps) => {

  // Use the enhanced match summary service
  const { data: enhancedData, isLoading, isSuccess } = useEnhancedMatchSummary(selectedFixtureData?.id);

  // Use enhanced data when available, fallback to local data
  const displayData = isSuccess && enhancedData ? {
    goals: enhancedData.goals,
    cards: enhancedData.cards,
    trackedPlayers: enhancedData.playerTimes,
    homeScore: enhancedData.summary.homeTeamGoals,
    awayScore: enhancedData.summary.awayTeamGoals
  } : {
    goals,
    cards,
    trackedPlayers,
    homeScore,
    awayScore
  };

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Enhanced Match Summary
          {isSuccess && enhancedData && (
            <Database className="h-4 w-4 text-green-600" title="Powered by enhanced database service" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Service Status */}
        {isSuccess && enhancedData && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Enhanced data service active - displaying comprehensive match analytics from optimized database queries.
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

        {/* Match Events Timeline */}
        <MatchEventsTimeline
          events={events}
          formatTime={formatTime}
        />

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
