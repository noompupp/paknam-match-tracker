
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Trophy } from "lucide-react";
import { PlayerTime } from "@/types/database";
import EnhancedMatchHeader from "./components/EnhancedMatchHeader";
import KeyStatistics from "./components/KeyStatistics";
import GoalsAndAssistsSection from "./components/GoalsAndAssistsSection";
import PlayerPerformanceHighlights from "./components/PlayerPerformanceHighlights";
import DisciplinaryActionsSection from "./components/DisciplinaryActionsSection";
import EnhancedPlayerTimeSummary from "./components/EnhancedPlayerTimeSummary";
import MatchEventsTimeline from "./components/MatchEventsTimeline";

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
  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Enhanced Match Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Result */}
        <EnhancedMatchHeader
          selectedFixtureData={selectedFixtureData}
          homeScore={homeScore}
          awayScore={awayScore}
          matchTime={matchTime}
          trackedPlayers={trackedPlayers}
          formatTime={formatTime}
        />

        <Separator />

        {/* Key Statistics Dashboard */}
        <KeyStatistics
          events={events}
          goals={goals}
          cards={cards}
          trackedPlayers={trackedPlayers}
        />

        <Separator />

        {/* Goals & Assists Summary */}
        <GoalsAndAssistsSection
          selectedFixtureData={selectedFixtureData}
          goals={goals}
          allPlayers={allPlayers}
          formatTime={formatTime}
        />

        <Separator />

        {/* Player Performance Highlights */}
        <PlayerPerformanceHighlights
          trackedPlayers={trackedPlayers}
          formatTime={formatTime}
        />

        {trackedPlayers.length > 0 && <Separator />}

        {/* Cards Summary */}
        <DisciplinaryActionsSection
          selectedFixtureData={selectedFixtureData}
          cards={cards}
          formatTime={formatTime}
        />

        <Separator />

        {/* Player Time Summary */}
        <EnhancedPlayerTimeSummary
          trackedPlayers={trackedPlayers}
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
