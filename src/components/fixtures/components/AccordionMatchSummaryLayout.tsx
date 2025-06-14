import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Trophy } from "lucide-react";
import CollapsibleScoreBanner from "./CollapsibleScoreBanner";
import EnhancedMatchStats from "./EnhancedMatchStats";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";

interface AccordionMatchSummaryLayoutProps {
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

const AccordionMatchSummaryLayout = ({
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
}: AccordionMatchSummaryLayoutProps) => {
  // Extract team data using the existing utility
  const teamData = extractTeamData(fixture);
  const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

  const totalEvents = goals.length + cards.length;

  return (
    <div className="space-y-6">
      {/* New Collapsible Score Banner with Integrated Timeline */}
      <CollapsibleScoreBanner
        fixture={fixture}
        goals={goals}
        cards={cards}
        timelineEvents={timelineEvents}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
        processedEvents={processedEvents}
        formatTime={formatTime}
        getGoalPlayerName={getGoalPlayerName}
        getGoalTime={getGoalTime}
        getCardTeamId={getCardTeamId}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />

      {/* Match Statistics Card */}
      <Card className="premier-card-shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Match Statistics</h3>
            <span className="text-sm text-muted-foreground ml-2">
              (Player participation & performance data)
            </span>
          </div>
          <EnhancedMatchStats
            fixture={fixture}
            homeGoalsCount={processedEvents.homeGoals.length}
            awayGoalsCount={processedEvents.awayGoals.length}
            cardsCount={cards.length}
            timelineEventsCount={timelineEvents.length}
            homeTeamColor={teamData.homeTeamColor}
            awayTeamColor={teamData.awayTeamColor}
            goals={goals}
            cards={cards}
            timelineEvents={timelineEvents}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccordionMatchSummaryLayout;
