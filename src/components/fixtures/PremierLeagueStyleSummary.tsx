
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import EnhancedMatchDetails from "./EnhancedMatchDetails";
import PremierLeagueHeader from "./PremierLeagueHeader";
import GoalsSection from "./GoalsSection";
import CardsSection from "./CardsSection";
import MatchStatisticsFooter from "./MatchStatisticsFooter";
import { filterGoalsByTeam, normalizeTeamId } from "./utils/matchSummaryDataProcessor";

interface PremierLeagueStyleSummaryProps {
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

const PremierLeagueStyleSummary = ({
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
}: PremierLeagueStyleSummaryProps) => {
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  console.log('🎨 PremierLeagueStyleSummary: Processing fixture data:', {
    fixtureId: fixture?.id,
    homeTeamId: fixture?.home_team_id,
    awayTeamId: fixture?.away_team_id,
    homeTeamName: fixture?.home_team?.name,
    awayTeamName: fixture?.away_team?.name,
    totalGoals: goals.length,
    totalCards: cards.length,
    goalsData: goals.map(g => ({
      id: g.id,
      teamId: getGoalTeamId(g),
      player: getGoalPlayerName(g),
      time: getGoalTime(g)
    }))
  });

  // Enhanced team filtering with comprehensive logging
  const homeTeamId = normalizeTeamId(fixture?.home_team_id);
  const awayTeamId = normalizeTeamId(fixture?.away_team_id);
  const homeTeamName = fixture?.home_team?.name;
  const awayTeamName = fixture?.away_team?.name;

  console.log('🎨 PremierLeagueStyleSummary: Team identification:', {
    homeTeamId,
    awayTeamId,
    homeTeamName,
    awayTeamName
  });

  // Use enhanced filtering function
  const homeGoals = filterGoalsByTeam(goals, homeTeamId, homeTeamName);
  const awayGoals = filterGoalsByTeam(goals, awayTeamId, awayTeamName);

  // Get cards for each team using the same logic
  const homeCards = cards.filter(c => {
    const cardTeamId = getCardTeamId(c);
    return normalizeTeamId(cardTeamId) === homeTeamId;
  });
  
  const awayCards = cards.filter(c => {
    const cardTeamId = getCardTeamId(c);
    return normalizeTeamId(cardTeamId) === awayTeamId;
  });

  console.log('🎨 PremierLeagueStyleSummary: Final team data:', {
    homeGoals: homeGoals.length,
    awayGoals: awayGoals.length,
    homeCards: homeCards.length,
    awayCards: awayCards.length,
    homeGoalsData: homeGoals,
    awayGoalsData: awayGoals
  });

  // Enhanced team colors with better defaults
  const homeTeamColor = fixture.home_team?.color || "#1f2937"; // Dark gray default
  const awayTeamColor = fixture.away_team?.color || "#7c3aed"; // Purple default

  return (
    <div className="space-y-6">
      {/* Premier League Style Header with Enhanced Team Logos */}
      <PremierLeagueHeader 
        fixture={fixture}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
      />

      {/* Enhanced Goals Section - Pass the filtered goals */}
      <GoalsSection 
        goals={goals}
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
        getGoalPlayerName={getGoalPlayerName}
        getGoalTime={getGoalTime}
      />

      {/* Enhanced Collapsible Cards Section */}
      <CardsSection 
        cards={cards}
        homeCards={homeCards}
        awayCards={awayCards}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />

      {/* Enhanced Match Details */}
      <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between hover:bg-muted/50">
            <span>Match Details</span>
            {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2">
            <EnhancedMatchDetails 
              fixture={fixture}
              timelineEvents={timelineEvents}
              formatTime={formatTime}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Enhanced Match Statistics Footer */}
      <MatchStatisticsFooter 
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        cards={cards}
        timelineEvents={timelineEvents}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
        fixture={fixture}
      />
    </div>
  );
};

export default PremierLeagueStyleSummary;
