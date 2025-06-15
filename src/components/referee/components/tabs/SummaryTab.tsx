
import EnhancedMatchSummary from "../../EnhancedMatchSummary";
import MatchEvents from "../../MatchEvents";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { useDataValidation } from "@/hooks/useDataValidation";
// FIXED: Correct import path for UnifiedMatchTimer
import UnifiedMatchTimer from "../UnifiedMatchTimer";

interface SummaryTabProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  events: any[];
  goals: any[];
  cards: any[];
  trackedPlayers: any[];
  allPlayers: ComponentPlayer[];
  onExportSummary: () => void;
  formatTime: (seconds: number) => string;
  resetState?: {
    shouldUseLocalState: () => boolean;
    isInFreshResetState: () => boolean;
    lastResetTimestamp: string | null;
  };
}

const SummaryTab = ({
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
  formatTime,
  resetState,
  onToggleTimer,
  onResetMatch,
  isRunning
}: SummaryTabProps & {
  onToggleTimer?: () => void;
  onResetMatch?: () => void;
  isRunning?: boolean;
}) => {
  
  // Add data validation for this component
  useDataValidation({
    componentName: 'SummaryTab',
    goals,
    cards,
    enabled: true
  });

  return (
    <div className="space-y-6">
      {/* UnifiedMatchTimer is now rendered in the parent RefereeTabsContent, so not needed here */}
      <EnhancedMatchSummary
        selectedFixtureData={selectedFixtureData}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        events={events}
        goals={goals}
        cards={cards}
        trackedPlayers={trackedPlayers}
        allPlayers={allPlayers}
        onExportSummary={onExportSummary}
        formatTime={formatTime}
        resetState={resetState}
      />
      
      {/* Traditional Match Events */}
      <MatchEvents
        events={events}
        formatTime={formatTime}
      />
    </div>
  );
};

export default SummaryTab;

