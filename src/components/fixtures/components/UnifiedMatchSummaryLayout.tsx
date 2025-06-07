
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";
import IPhoneStoryLayout from "./export/IPhoneStoryLayout";
import EnhancedMatchEventsTimeline from "../../referee/components/EnhancedMatchEventsTimeline";
import PremierLeagueMatchHeader from "./PremierLeagueMatchHeader";
import MatchEventsSection from "./MatchEventsSection";
import DisciplinarySection from "./DisciplinarySection";
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
  const isMobile = useIsMobile();
  
  // Extract team data using the existing utility
  const teamData = extractTeamData(fixture);
  const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

  // Check if we're in export mode on mobile
  const isExportMode = isMobile && document.getElementById('match-summary-content')?.classList.contains('export-mode-mobile');

  // Use iPhone story layout for mobile export mode
  if (isMobile && isExportMode) {
    return (
      <IPhoneStoryLayout
        fixture={fixture}
        goals={goals}
        cards={cards}
        homeGoals={processedEvents.homeGoals}
        awayGoals={processedEvents.awayGoals}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
        timelineEvents={timelineEvents}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Premier League Style Header */}
      <PremierLeagueMatchHeader
        fixture={fixture}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
      />

      {/* Match Events Section */}
      <MatchEventsSection
        goals={goals}
        fixture={fixture}
        processedEvents={processedEvents}
        teamData={teamData}
        getGoalPlayerName={getGoalPlayerName}
        getGoalTime={getGoalTime}
      />

      {/* Collapsible Cards Section */}
      <DisciplinarySection
        cards={cards}
        fixture={fixture}
        teamData={teamData}
        getCardTeamId={getCardTeamId}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />

      {/* Enhanced Match Timeline Section */}
      {timelineEvents.length > 0 && (
        <Card className="border-2">
          <CardContent className="pt-6">
            <h4 className="font-bold flex items-center gap-3 mb-6 text-xl text-slate-700">
              <Clock className="h-6 w-6" />
              Match Timeline ({timelineEvents.length})
            </h4>
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
              <EnhancedMatchEventsTimeline
                timelineEvents={timelineEvents}
                formatTime={formatTime}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Summary Statistics Box */}
      <MatchStatisticsSummary
        fixture={fixture}
        processedEvents={processedEvents}
        teamData={teamData}
        cards={cards}
      />
    </div>
  );
};

export default UnifiedMatchSummaryLayout;
