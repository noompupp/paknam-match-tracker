
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import EnhancedMatchEventsTimeline from "../../referee/components/EnhancedMatchEventsTimeline";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";
import MatchHeaderSection from "./MatchHeaderSection";
import MatchEventsSection from "./MatchEventsSection";
import MatchStatisticsSummary from "./MatchStatisticsSummary";

interface UnifiedMatchSummaryLayoutProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
  getGoalTeamId: (goal: any) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const UnifiedMatchSummaryLayout = ({
  fixture,
  goals,
  cards,
  timelineEvents,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: UnifiedMatchSummaryLayoutProps) => {
  // Extract team data using the existing utility
  const teamData = extractTeamData(fixture);
  const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

  return (
    <div className="space-y-6">
      {/* Header Section with Premier League styling */}
      <MatchHeaderSection
        fixture={fixture}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
      />

      {/* Match Events Section (replaces Goals Section) */}
      <MatchEventsSection
        goals={goals}
        cards={cards}
        processedEvents={processedEvents}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
        getGoalPlayerName={getGoalPlayerName}
        getGoalTime={getGoalTime}
        getCardTeamId={getCardTeamId}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
        fixture={fixture}
      />

      {/* Summary Statistics Box */}
      <MatchStatisticsSummary
        fixture={fixture}
        homeGoalsCount={processedEvents.homeGoals.length}
        awayGoalsCount={processedEvents.awayGoals.length}
        cardsCount={cards.length}
        timelineEventsCount={timelineEvents.length}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
      />

      {/* Match Timeline Section */}
      {timelineEvents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4" />
              Match Timeline ({timelineEvents.length})
            </h4>
            <EnhancedMatchEventsTimeline
              timelineEvents={timelineEvents}
              formatTime={formatTime}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedMatchSummaryLayout;
