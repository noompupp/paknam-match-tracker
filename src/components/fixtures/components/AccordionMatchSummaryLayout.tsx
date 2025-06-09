
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Clock, BarChart3, Trophy } from "lucide-react";
import MatchHeaderSection from "./MatchHeaderSection";
import MatchEventsSection from "./MatchEventsSection";
import EnhancedMatchStats from "./EnhancedMatchStats";
import EnhancedMatchEventsTimeline from "../../referee/components/EnhancedMatchEventsTimeline";
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

  // Manage persistent accordion state
  const [accordionValue, setAccordionValue] = useState<string[]>(['match-events']);

  return (
    <div className="space-y-6">
      {/* Centered Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Match Summary</h2>
        </div>
        <p className="text-muted-foreground">Comprehensive match overview and statistics</p>
      </div>

      {/* Header Section with Premier League styling */}
      <MatchHeaderSection
        fixture={fixture}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
      />

      {/* Accordion Sections */}
      <Card className="premier-card-shadow-lg">
        <CardContent className="p-0">
          <Accordion 
            type="multiple" 
            value={accordionValue}
            onValueChange={setAccordionValue}
            className="w-full"
          >
            {/* Match Events - Expanded by default */}
            <AccordionItem value="match-events" className="border-b last:border-b-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Match Events</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({goals.length + cards.length} events)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-0">
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
              </AccordionContent>
            </AccordionItem>

            {/* Match Statistics - Collapsed by default */}
            <AccordionItem value="match-stats" className="border-b last:border-b-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Match Statistics</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    (Player participation & stats)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-0">
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
              </AccordionContent>
            </AccordionItem>

            {/* Match Timeline - Collapsed by default */}
            {timelineEvents.length > 0 && (
              <AccordionItem value="match-timeline" className="border-b last:border-b-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Match Timeline</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({timelineEvents.length} events)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <EnhancedMatchEventsTimeline
                    timelineEvents={timelineEvents}
                    formatTime={formatTime}
                  />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccordionMatchSummaryLayout;
