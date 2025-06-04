
import { ComponentPlayer } from "../hooks/useRefereeState";
import NoMatchSelectedPlaceholder from "./NoMatchSelectedPlaceholder";
import MatchHeaderWithScore from "./MatchHeaderWithScore";
import GoalsSummaryDisplay from "./GoalsSummaryDisplay";
import CardsSummaryDisplay from "./CardsSummaryDisplay";
import PlayerTimeTrackingDisplay from "./PlayerTimeTrackingDisplay";
import { useQuery } from '@tanstack/react-query';
import { enhancedMatchSummaryService } from '@/services/fixtures/enhancedMatchSummaryService';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface EnhancedMatchSummaryDisplayProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  goals: any[];
  cards: any[];
  trackedPlayers: any[];
  allPlayers: ComponentPlayer[];
  formatTime: (seconds: number) => string;
}

const EnhancedMatchSummaryDisplay = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  goals,
  cards,
  trackedPlayers,
  allPlayers,
  formatTime
}: EnhancedMatchSummaryDisplayProps) => {
  
  // Fetch enhanced match summary data from database
  const { data: enhancedData, isLoading, error } = useQuery({
    queryKey: ['enhancedMatchSummary', selectedFixtureData?.id],
    queryFn: () => enhancedMatchSummaryService.getEnhancedMatchSummary(selectedFixtureData.id),
    enabled: !!selectedFixtureData?.id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  if (!selectedFixtureData) {
    return <NoMatchSelectedPlaceholder />;
  }

  // Enhanced time formatting for better display
  const formatTimeInMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}'`;
  };

  // Use enhanced data if available, fallback to local data
  const goalsToDisplay = enhancedData?.goals.length ? enhancedData.goals : goals;
  const cardsToDisplay = enhancedData?.cards.length ? enhancedData.cards : cards;
  const playerTimesToDisplay = enhancedData?.playerTimes.length ? enhancedData.playerTimes : trackedPlayers;

  // Calculate scores from enhanced data if available
  const calculatedHomeScore = enhancedData?.summary ? enhancedData.summary.homeTeamGoals : homeScore;
  const calculatedAwayScore = enhancedData?.summary ? enhancedData.summary.awayTeamGoals : awayScore;

  console.log('📊 EnhancedMatchSummaryDisplay: Rendering with enhanced data integration:', {
    fixture: selectedFixtureData.id,
    homeScore: calculatedHomeScore,
    awayScore: calculatedAwayScore,
    enhancedGoalsCount: enhancedData?.goals.length || 0,
    localGoalsCount: goals.length,
    enhancedCardsCount: enhancedData?.cards.length || 0,
    localCardsCount: cards.length,
    usingEnhancedData: !!enhancedData,
    fixtureId: selectedFixtureData.id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading enhanced match summary...</span>
      </div>
    );
  }

  if (error) {
    console.error('❌ EnhancedMatchSummaryDisplay: Error loading enhanced data:', error);
    // Continue with local data as fallback
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Data Status Indicator */}
      {enhancedData && (
        <Alert>
          <AlertDescription>
            ✅ Enhanced match data loaded from database with {enhancedData.goals.length} goals/assists, {enhancedData.cards.length} cards, and {enhancedData.playerTimes.length} player time records.
          </AlertDescription>
        </Alert>
      )}

      {/* Match Header with Real-time Score */}
      <MatchHeaderWithScore
        selectedFixtureData={selectedFixtureData}
        homeScore={calculatedHomeScore}
        awayScore={calculatedAwayScore}
        matchTime={matchTime}
        formatTime={formatTimeInMinutes}
      />

      {/* Goals Summary with Enhanced Display and Database Integration */}
      <GoalsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        goals={goalsToDisplay}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />

      {/* Cards Summary with Database Integration */}
      <CardsSummaryDisplay
        selectedFixtureData={selectedFixtureData}
        cards={cardsToDisplay}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />

      {/* Player Time Tracking with Enhanced Data */}
      <PlayerTimeTrackingDisplay
        trackedPlayers={playerTimesToDisplay.map(player => ({
          ...player,
          totalTime: Math.floor((player.totalMinutes || player.totalTime || 0) * 60), // Convert to seconds for display consistency
          displayTime: formatTimeInMinutes((player.totalMinutes || player.totalTime || 0) * 60)
        }))}
        formatTime={formatTimeInMinutes}
        fixtureId={selectedFixtureData.id}
      />

      {/* Enhanced Summary Statistics */}
      {enhancedData?.summary && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Match Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{enhancedData.summary.totalGoals}</div>
              <div className="text-muted-foreground">Goals</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{enhancedData.summary.totalAssists}</div>
              <div className="text-muted-foreground">Assists</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{enhancedData.summary.totalCards}</div>
              <div className="text-muted-foreground">Cards</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{enhancedData.summary.playersTracked}</div>
              <div className="text-muted-foreground">Players Tracked</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMatchSummaryDisplay;
