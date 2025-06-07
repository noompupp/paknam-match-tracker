
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";
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
import MatchSummaryExportActions from "./components/MatchSummaryExportActions";

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
      <DialogContent className="w-[96vw] max-w-[96vw] md:max-w-5xl lg:max-w-6xl max-h-[95vh] overflow-y-auto p-3 md:p-6 mx-auto">
        <DialogHeader className="pb-2 md:pb-4">
          <DialogTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-base md:text-lg lg:text-xl font-bold">Match Summary</span>
            </div>
            <MatchSummaryViewToggle 
              viewStyle={viewStyle} 
              onToggle={setViewStyle}
            />
          </DialogTitle>
        </DialogHeader>

        <div className="max-w-5xl mx-auto">
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

          <div className="mt-4 md:mt-6">
            <MatchSummaryExportActions
              fixture={fixture}
              matchEvents={matchEvents || []}
              goals={goals}
              cards={cards}
              enhancedSuccess={enhancedSuccess}
              enhancedData={enhancedData}
              formatTime={formatTime}
              getGoalTeamId={getGoalTeamId}
              getGoalPlayerName={getGoalPlayerName}
              getGoalTime={getGoalTime}
              getCardTeamId={getCardTeamId}
              getCardPlayerName={getCardPlayerName}
              getCardTime={getCardTime}
              getCardType={getCardType}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchSummaryDialog;
