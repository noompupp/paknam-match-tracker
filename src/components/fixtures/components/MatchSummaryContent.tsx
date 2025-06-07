
import UnifiedMatchSummaryLayout from "./UnifiedMatchSummaryLayout";
import { useIsMobile } from "@/hooks/use-mobile";

interface MatchSummaryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  viewStyle?: 'compact' | 'full'; // Keep for backward compatibility but don't use
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
      {/* Unified responsive container with optimized iPhone export */}
      <div className={`w-full mx-auto ${
        isMobile 
          ? isExportMode 
            ? 'max-w-[375px] min-h-[812px] aspect-[375/812] p-0 bg-white' 
            : 'max-w-[375px]'
          : 'max-w-[768px]'
      }`}>
        {/* Always use the unified layout */}
        <UnifiedMatchSummaryLayout
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
      </div>

      {/* Export mode specific styles optimized for iPhone */}
      <style>{`
        .export-mode-mobile {
          font-size: 14px;
          line-height: 1.4;
        }
        
        .export-mode-mobile .text-xs {
          font-size: 11px;
          line-height: 1.3;
        }
        
        .export-mode-mobile .text-sm {
          font-size: 12px;
          line-height: 1.4;
        }
        
        .export-mode-mobile .text-base {
          font-size: 14px;
          line-height: 1.4;
        }
        
        .export-mode-mobile .text-lg {
          font-size: 16px;
          line-height: 1.3;
        }
        
        .export-mode-mobile .text-xl {
          font-size: 18px;
          line-height: 1.2;
        }
        
        .export-mode-mobile .text-2xl {
          font-size: 20px;
          line-height: 1.2;
        }
        
        .export-mode-mobile .text-3xl {
          font-size: 24px;
          line-height: 1.1;
        }
        
        .export-mode-mobile .text-4xl {
          font-size: 28px;
          line-height: 1.1;
        }
        
        .export-mode-mobile .text-5xl {
          font-size: 32px;
          line-height: 1.1;
        }
        
        /* Optimize spacing for iPhone layout */
        .export-mode-mobile .space-y-6 > * + * {
          margin-top: 0;
        }
        
        .export-mode-mobile .space-y-4 > * + * {
          margin-top: 0;
        }
        
        .export-mode-mobile .space-y-3 > * + * {
          margin-top: 0.5rem;
        }
        
        .export-mode-mobile .space-y-2 > * + * {
          margin-top: 0.375rem;
        }
      `}</style>
    </div>
  );
};

export default MatchSummaryContent;
