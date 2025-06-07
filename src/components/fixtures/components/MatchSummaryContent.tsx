
import PremierLeagueStyleSummary from "../PremierLeagueStyleSummary";
import TraditionalMatchSummaryView from "./TraditionalMatchSummaryView";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";
import { useIsMobile } from "@/hooks/use-mobile";

interface MatchSummaryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  viewStyle: 'compact' | 'full';
  isExportMode?: boolean;
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

const MatchSummaryContent = ({
  fixture,
  goals,
  cards,
  timelineEvents,
  enhancedSuccess,
  enhancedData,
  viewStyle,
  isExportMode = false,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: MatchSummaryContentProps) => {
  const isMobile = useIsMobile();

  return (
    <div 
      id="match-summary-content" 
      className={`space-y-6 w-full ${isExportMode ? 'export-mode' : ''} ${isMobile && isExportMode ? 'export-mode-mobile' : ''}`}
    >
      {/* Unified responsive container with export optimization */}
      <div className={`w-full mx-auto ${
        isMobile 
          ? isExportMode 
            ? 'max-w-[375px] min-h-[667px] aspect-[9/16] p-4 bg-white' 
            : 'max-w-[375px]'
          : 'max-w-[768px]'
      }`}>
        {/* Render based on view style with unified responsive design */}
        {viewStyle === 'compact' ? (
          <PremierLeagueStyleSummary
            fixture={fixture}
            goals={goals}
            cards={cards}
            timelineEvents={timelineEvents}
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
        ) : (
          <TraditionalMatchSummaryView
            fixture={fixture}
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
            isCardRed={isCardRed}
          />
        )}
      </div>

      {/* Export mode specific styles */}
      <style>{`
        .export-mode-mobile {
          font-size: 14px;
          line-height: 1.4;
        }
        
        .export-mode-mobile .text-xs {
          font-size: 12px;
        }
        
        .export-mode-mobile .text-sm {
          font-size: 13px;
        }
        
        .export-mode-mobile .text-base {
          font-size: 14px;
        }
        
        .export-mode-mobile .text-lg {
          font-size: 16px;
        }
        
        .export-mode-mobile .text-xl {
          font-size: 18px;
        }
        
        .export-mode-mobile .text-2xl {
          font-size: 20px;
        }
        
        .export-mode-mobile .text-3xl {
          font-size: 24px;
        }
        
        .export-mode-mobile .text-4xl {
          font-size: 28px;
        }
        
        .export-mode-mobile .text-5xl {
          font-size: 32px;
        }
      `}</style>
    </div>
  );
};

export default MatchSummaryContent;
