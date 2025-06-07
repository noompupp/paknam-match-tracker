
import { Card, CardContent } from "@/components/ui/card";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";
import IPhoneStoryLayout from "./export/IPhoneStoryLayout";
import MatchHeaderSection from "./MatchHeaderSection";
import MatchEventsSection from "./MatchEventsSection";
import MatchStatisticsSummary from "./MatchStatisticsSummary";
import CollapsibleMatchTimeline from "./CollapsibleMatchTimeline";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  console.log('🎯 UnifiedMatchSummaryLayout - Props Analysis:', {
    fixtureId: fixture?.id,
    goalsCount: goals.length,
    cardsCount: cards.length,
    timelineEventsCount: timelineEvents.length,
    goalSample: goals.length > 0 ? {
      id: goals[0].id,
      playerName: getGoalPlayerName(goals[0]),
      time: getGoalTime(goals[0]),
      teamId: getGoalTeamId(goals[0])
    } : null,
    cardSample: cards.length > 0 ? {
      id: cards[0].id,
      playerName: getCardPlayerName(cards[0]),
      time: getCardTime(cards[0]),
      teamId: getCardTeamId(cards[0])
    } : null
  });

  // Extract team data using the existing utility
  const teamData = extractTeamData(fixture);
  const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

  console.log('🎯 UnifiedMatchSummaryLayout - Processed Events:', {
    teamData,
    processedEvents: {
      homeGoals: processedEvents.homeGoals.length,
      awayGoals: processedEvents.awayGoals.length,
      homeCards: processedEvents.homeCards.length,
      awayCards: processedEvents.awayCards.length
    },
    homeGoalPlayers: processedEvents.homeGoals.map(g => getGoalPlayerName(g)),
    awayGoalPlayers: processedEvents.awayGoals.map(g => getGoalPlayerName(g))
  });

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
      {/* Header Section with Premier League styling */}
      <MatchHeaderSection
        fixture={fixture}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
      />

      {/* Match Events Section - Enhanced with debugging and fallback handling */}
      <MatchEventsSection
        goals={goals}
        cards={cards}
        timelineEvents={timelineEvents}
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
        formatTime={formatTime}
      />

      {/* Collapsible Enhanced Match Timeline */}
      <CollapsibleMatchTimeline
        timelineEvents={timelineEvents}
        formatTime={formatTime}
        defaultOpen={false}
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
    </div>
  );
};

export default UnifiedMatchSummaryLayout;
