
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { BarChart3, Trophy, Clock } from "lucide-react";
import CollapsibleScoreBanner from "./CollapsibleScoreBanner";
import EnhancedMatchStats from "./EnhancedMatchStats";
import FullMatchTimeline from "./FullMatchTimeline";
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
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

  const totalEvents = goals.length + cards.length;

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

      {/* Score Banner - Always Visible */}
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

      {/* Accordion Sections */}
      <Card className="premier-card-shadow-lg">
        <CardContent className="p-0">
          <Accordion 
            type="multiple" 
            value={accordionValue}
            onValueChange={setAccordionValue}
            className="w-full"
          >
            {/* Match Timeline */}
            {totalEvents > 0 && (
              <AccordionItem value="match-timeline" className="border-b last:border-b-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Match Timeline</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({totalEvents} events detailed view)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <FullMatchTimeline
                    goals={goals}
                    cards={cards}
                    processedEvents={processedEvents}
                    homeTeamColor={teamData.homeTeamColor}
                    awayTeamColor={teamData.awayTeamColor}
                    getGoalPlayerName={getGoalPlayerName}
                    getGoalTime={getGoalTime}
                    getCardPlayerName={getCardPlayerName}
                    getCardTime={getCardTime}
                    getCardType={getCardType}
                    isCardRed={isCardRed}
                    fixture={fixture}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Match Statistics */}
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
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccordionMatchSummaryLayout;
