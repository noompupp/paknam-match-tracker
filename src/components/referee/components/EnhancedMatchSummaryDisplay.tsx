
import { ComponentPlayer } from "../hooks/useRefereeState";
import NoMatchSelectedPlaceholder from "./NoMatchSelectedPlaceholder";
import MatchHeaderWithScore from "./MatchHeaderWithScore";
import GoalsSummaryDisplay from "./GoalsSummaryDisplay";
import CardsSummaryDisplay from "./CardsSummaryDisplay";
import PlayerTimeTrackingDisplay from "./PlayerTimeTrackingDisplay";
import { useEnhancedMatchSummary } from '@/hooks/useEnhancedMatchSummary';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

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
  
  // Fetch enhanced match summary data from the improved service
  const { data: enhancedData, isLoading, error, isSuccess } = useEnhancedMatchSummary(selectedFixtureData?.id);

  if (!selectedFixtureData) {
    return <NoMatchSelectedPlaceholder />;
  }

  // Enhanced time formatting for better display
  const formatTimeInMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}'`;
  };

  // Use enhanced data if available, with intelligent fallback to local data
  const shouldUseEnhancedData = enhancedData && isSuccess;
  const goalsToDisplay = shouldUseEnhancedData ? enhancedData.goals : goals;
  const cardsToDisplay = shouldUseEnhancedData ? enhancedData.cards : cards;
  const playerTimesToDisplay = shouldUseEnhancedData ? enhancedData.playerTimes : trackedPlayers;

  // Calculate scores from enhanced data if available
  const calculatedHomeScore = shouldUseEnhancedData ? enhancedData.summary.homeTeamGoals : homeScore;
  const calculatedAwayScore = shouldUseEnhancedData ? enhancedData.summary.awayTeamGoals : awayScore;

  console.log('📊 EnhancedMatchSummaryDisplay: Rendering with enhanced service integration:', {
    fixture: selectedFixtureData.id,
    homeScore: calculatedHomeScore,
    awayScore: calculatedAwayScore,
    enhancedGoalsCount: enhancedData?.goals.length || 0,
    localGoalsCount: goals.length,
    enhancedCardsCount: enhancedData?.cards.length || 0,
    localCardsCount: cards.length,
    usingEnhancedData: shouldUseEnhancedData,
    dataSource: shouldUseEnhancedData ? 'enhanced-service' : 'local-state'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading enhanced match data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Data Status Indicator */}
      {shouldUseEnhancedData && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ✅ Enhanced match data loaded successfully from improved database service with {enhancedData.goals.length} goals/assists, {enhancedData.cards.length} cards, and {enhancedData.playerTimes.length} player time records.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Enhanced data service unavailable. Using local match data as fallback.
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
      {shouldUseEnhancedData && enhancedData.summary && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Enhanced Match Statistics</h4>
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
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Data source: Enhanced database service
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMatchSummaryDisplay;
