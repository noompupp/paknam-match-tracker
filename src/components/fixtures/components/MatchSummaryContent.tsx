
import PremierLeagueStyleSummary from "../PremierLeagueStyleSummary";
import TraditionalMatchSummaryView from "./TraditionalMatchSummaryView";
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
      className={`w-full ${isExportMode ? 'export-mode' : ''} ${isMobile && isExportMode ? 'export-mode-mobile' : ''}`}
    >
      {/* Unified responsive container with enhanced mobile export optimization */}
      <div className={`w-full mx-auto ${
        isMobile 
          ? isExportMode 
            ? 'max-w-[375px] min-h-[600px] p-4 bg-white' 
            : 'max-w-[375px] px-4'
          : 'max-w-[768px] px-6'
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

      {/* Enhanced export mode styles with better mobile typography */}
      <style jsx>{`
        .export-mode-mobile {
          font-size: 14px !important;
          line-height: 1.4 !important;
        }
        
        .export-mode-mobile .text-xs {
          font-size: 12px !important;
        }
        
        .export-mode-mobile .text-sm {
          font-size: 13px !important;
        }
        
        .export-mode-mobile .text-base {
          font-size: 14px !important;
        }
        
        .export-mode-mobile .text-lg {
          font-size: 16px !important;
        }
        
        .export-mode-mobile .text-xl {
          font-size: 18px !important;
        }
        
        .export-mode-mobile .text-2xl {
          font-size: 20px !important;
        }
        
        .export-mode-mobile .text-3xl {
          font-size: 24px !important;
        }
        
        .export-mode-mobile .text-4xl {
          font-size: 28px !important;
        }
        
        .export-mode-mobile * {
          max-width: 100% !important;
          word-wrap: break-word !important;
        }
        
        .export-mode-mobile img {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
    </div>
  );
};

export default MatchSummaryContent;
