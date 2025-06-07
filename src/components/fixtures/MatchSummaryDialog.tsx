
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Database } from "lucide-react";
import { useMatchEvents } from "@/hooks/useMatchEvents";
import { useEnhancedMatchSummary } from "@/hooks/useEnhancedMatchSummary";
import { useState } from "react";
import { 
  processUnifiedMatchData,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
} from "./utils/matchSummaryDataProcessor";
import MatchSummaryViewToggle from "./components/MatchSummaryViewToggle";
import MatchSummaryContent from "./components/MatchSummaryContent";
import MatchSummaryShareActions from "./components/MatchSummaryShareActions";

interface MatchSummaryDialogProps {
  fixture: any;
  isOpen: boolean;
  onClose: () => void;
}

const MatchSummaryDialog = ({ fixture, isOpen, onClose }: MatchSummaryDialogProps) => {
  const { data: matchEvents, isLoading } = useMatchEvents(fixture?.id);
  const { data: enhancedData, isSuccess: enhancedSuccess } = useEnhancedMatchSummary(fixture?.id);
  const [viewStyle, setViewStyle] = useState<'compact' | 'full'>('compact');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Use Enhanced Timeline as primary data source
  let goals, cards, timelineEvents = [];

  if (enhancedSuccess && enhancedData?.timelineEvents?.length > 0) {
    const unifiedData = processUnifiedMatchData(enhancedData);
    goals = unifiedData.goals;
    cards = unifiedData.cards;
    timelineEvents = unifiedData.timelineEvents;
    console.log('✅ Using Enhanced Timeline data:', { goals: goals.length, cards: cards.length });
  } else {
    // Fallback to match events
    goals = (matchEvents || []).filter(event => event.event_type === 'goal');
    cards = (matchEvents || []).filter(event => 
      event.event_type === 'yellow_card' || event.event_type === 'red_card'
    );
    timelineEvents = matchEvents || [];
    console.log('⚠️ Using fallback match events data:', { goals: goals.length, cards: cards.length });
  }

  if (!fixture) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Match Summary
              {enhancedSuccess && enhancedData?.timelineEvents?.length > 0 && (
                <Database className="h-4 w-4 text-green-600" />
              )}
            </div>
            <MatchSummaryViewToggle 
              viewStyle={viewStyle} 
              onToggle={setViewStyle}
            />
          </DialogTitle>
        </DialogHeader>

        <MatchSummaryContent
          fixture={fixture}
          goals={goals}
          cards={cards}
          timelineEvents={timelineEvents}
          enhancedSuccess={enhancedSuccess}
          enhancedData={enhancedData}
          viewStyle={viewStyle}
          formatTime={formatTime}
          getGoalTeamId={getGoalTeamId}
          getGoalPlayerName={getGoalPlayerName}
          getGoalTime={getGoalTime}
          getCardTeamId={getCardTeamId}
          getCardPlayerName={getCardPlayerName}
          getCardTime={getCardTime}
          getCardType={getCardType}
          isCardRed={isCardRed}
        />

        <MatchSummaryShareActions 
          fixture={fixture} 
          goals={goals}
          cards={cards}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MatchSummaryDialog;
