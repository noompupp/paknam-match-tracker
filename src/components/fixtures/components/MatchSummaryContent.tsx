
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
      className={`w-full font-sans ${isExportMode ? 'export-mode' : ''} ${isMobile && isExportMode ? 'export-mode-mobile' : ''}`}
    >
      {/* Enhanced responsive container with better typography */}
      <div className={`w-full mx-auto ${
        isMobile 
          ? isExportMode 
            ? 'max-w-[375px] min-h-[700px] p-4 bg-white' 
            : 'max-w-[375px] px-4'
          : 'max-w-[768px] px-6'
      }`}>
        {/* Render based on view style with enhanced design */}
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

      {/* Enhanced export mode styles with improved typography and mobile optimization */}
      <style>
        {`
        .export-mode {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
        
        .export-mode-mobile {
          font-size: 14px !important;
          line-height: 1.5 !important;
          letter-spacing: 0.01em !important;
        }
        
        .export-mode-mobile * {
          max-width: 100% !important;
          word-wrap: break-word !important;
          box-sizing: border-box !important;
        }
        
        .export-mode-mobile .text-xs {
          font-size: 12px !important;
          line-height: 1.4 !important;
        }
        
        .export-mode-mobile .text-sm {
          font-size: 13px !important;
          line-height: 1.4 !important;
        }
        
        .export-mode-mobile .text-base {
          font-size: 14px !important;
          line-height: 1.5 !important;
        }
        
        .export-mode-mobile .text-lg {
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
        
        .export-mode-mobile .text-xl {
          font-size: 18px !important;
          line-height: 1.4 !important;
        }
        
        .export-mode-mobile .text-2xl {
          font-size: 20px !important;
          line-height: 1.3 !important;
        }
        
        .export-mode-mobile .text-3xl {
          font-size: 24px !important;
          line-height: 1.2 !important;
        }
        
        .export-mode-mobile .text-4xl {
          font-size: 28px !important;
          line-height: 1.1 !important;
        }
        
        .export-mode-mobile img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px !important;
        }
        
        .export-mode-mobile .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
        
        .export-mode-mobile .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
        
        .export-mode-mobile .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        `}
      </style>
    </div>
  );
};

export default MatchSummaryContent;
