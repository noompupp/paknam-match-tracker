
import EnhancedMatchSummary from "../../EnhancedMatchSummary";
import MatchEvents from "../../MatchEvents";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { useDataValidation } from "@/hooks/useDataValidation";

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
  formatTime
}: SummaryTabProps) => {
  
  // Add data validation for this component
  useDataValidation({
    componentName: 'SummaryTab',
    goals,
    cards,
    enabled: true
  });

  return (
    <div className="space-y-6">
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
