
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Database } from "lucide-react";
import { useMatchEvents } from "@/hooks/useMatchEvents";
import { useEnhancedMatchSummary } from "@/hooks/useEnhancedMatchSummary";
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
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6 safe-top sm:pt-6 pt-8">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Match Summary</span>
            {enhancedSuccess && enhancedData?.timelineEvents?.length > 0 && (
              <Database className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <MatchSummaryContent
            fixture={fixture}
            goals={goals}
            cards={cards}
            timelineEvents={timelineEvents}
            enhancedSuccess={enhancedSuccess}
            enhancedData={enhancedData}
            isExportMode={false}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchSummaryDialog;
