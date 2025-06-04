
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Trophy } from "lucide-react";
import { PlayerTime } from "@/types/database";
import MatchSummaryHeader from "./components/MatchSummaryHeader";
import GoalsSummarySection from "./components/GoalsSummarySection";
import CardsSummarySection from "./components/CardsSummarySection";
import PlayerTimeSummarySection from "./components/PlayerTimeSummarySection";
import MatchEventsSummarySection from "./components/MatchEventsSummarySection";

interface MatchSummaryProps {
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

const MatchSummary = ({
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
}: MatchSummaryProps) => {
  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Match Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Result */}
        <MatchSummaryHeader
          selectedFixtureData={selectedFixtureData}
          homeScore={homeScore}
          awayScore={awayScore}
          matchTime={matchTime}
          trackedPlayers={trackedPlayers}
          formatTime={formatTime}
        />

        <Separator />

        {/* Goals Summary */}
        <GoalsSummarySection
          goals={goals}
          selectedFixtureData={selectedFixtureData}
          allPlayers={allPlayers}
          formatTime={formatTime}
        />

        <Separator />

        {/* Cards Summary */}
        <CardsSummarySection
          cards={cards}
          selectedFixtureData={selectedFixtureData}
          formatTime={formatTime}
        />

        <Separator />

        {/* Player Time Summary */}
        <PlayerTimeSummarySection
          trackedPlayers={trackedPlayers}
          formatTime={formatTime}
        />

        <Separator />

        {/* Match Events Summary */}
        <MatchEventsSummarySection
          events={events}
          formatTime={formatTime}
        />

        {/* Export Button */}
        <Button onClick={onExportSummary} className="w-full" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Match Summary
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatchSummary;
