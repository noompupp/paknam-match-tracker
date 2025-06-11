
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import MobileMatchHeader from "./MobileMatchHeader";
import DesktopMatchHeader from "./DesktopMatchHeader";
import CompactMobileMatchHeader from "./CompactMobileMatchHeader";
import CompactGoalScorers from "./CompactGoalScorers";
import MirroredMatchTimeline from "./MirroredMatchTimeline";

interface CollapsibleScoreBannerProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  processedEvents: any;
  formatTime: (seconds: number) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const CollapsibleScoreBanner = ({
  fixture,
  goals,
  cards,
  processedEvents,
  homeTeamColor,
  awayTeamColor,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: CollapsibleScoreBannerProps) => {
  const isMobile = useIsMobile();
  const totalEvents = goals.length + cards.length;
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if we should show compact mode (mobile + timeline expanded)
  const shouldShowCompactMode = isMobile && isExpanded;

  return (
    <div className="space-y-4">
      {/* Main Score Banner with Responsive Height */}
      <Card className="overflow-hidden premier-card-shadow-lg match-border-gradient w-full">
        <div className={`
          ${isMobile ? 'p-4' : 'p-6'} 
          match-gradient-header w-full
          transition-all duration-300 ease-in-out
          ${shouldShowCompactMode ? 'pb-3' : ''}
        `}>
          {/* Score Display - Responsive Header */}
          <div className={`flex-1 transition-all duration-300 ease-in-out ${shouldShowCompactMode ? 'mb-2' : 'mb-4'}`}>
            {shouldShowCompactMode ? (
              <CompactMobileMatchHeader 
                fixture={fixture}
                homeTeamColor={homeTeamColor}
                awayTeamColor={awayTeamColor}
              />
            ) : isMobile ? (
              <MobileMatchHeader 
                fixture={fixture}
                homeTeamColor={homeTeamColor}
                awayTeamColor={awayTeamColor}
              />
            ) : (
              <DesktopMatchHeader 
                fixture={fixture}
                homeTeamColor={homeTeamColor}
                awayTeamColor={awayTeamColor}
              />
            )}
          </div>

          {/* Compact Goal Scorers and Events Summary - Hide in Compact Mode */}
          {totalEvents > 0 && (
            <div className={`
              transition-all duration-300 ease-in-out
              ${shouldShowCompactMode 
                ? 'opacity-0 max-h-0 overflow-hidden' 
                : 'opacity-100 max-h-screen mt-4 pt-4 border-t border-border/20'
              }
            `}>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Home Team Goals */}
                {processedEvents.homeGoals.length > 0 && (
                  <div className="transform transition-all duration-300 ease-in-out">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" style={{ color: homeTeamColor }} />
                      <span className="text-sm font-medium text-foreground">
                        {fixture.home_team?.name} Goals ({processedEvents.homeGoals.length})
                      </span>
                    </div>
                    <CompactGoalScorers
                      goals={processedEvents.homeGoals}
                      teamColor={homeTeamColor}
                      teamName={fixture.home_team?.name}
                      getGoalPlayerName={getGoalPlayerName}
                      getGoalTime={getGoalTime}
                    />
                  </div>
                )}

                {/* Away Team Goals */}
                {processedEvents.awayGoals.length > 0 && (
                  <div className="transform transition-all duration-300 ease-in-out">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" style={{ color: awayTeamColor }} />
                      <span className="text-sm font-medium text-foreground">
                        {fixture.away_team?.name} Goals ({processedEvents.awayGoals.length})
                      </span>
                    </div>
                    <CompactGoalScorers
                      goals={processedEvents.awayGoals}
                      teamColor={awayTeamColor}
                      teamName={fixture.away_team?.name}
                      getGoalPlayerName={getGoalPlayerName}
                      getGoalTime={getGoalTime}
                    />
                  </div>
                )}
              </div>

              {/* Cards Summary */}
              {cards.length > 0 && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/10 transform transition-all duration-300 ease-in-out">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {cards.length} disciplinary action{cards.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Integrated Toggle Button */}
          {totalEvents > 0 && (
            <div className={`
              flex items-center justify-center border-t border-border/10
              transition-all duration-300 ease-in-out
              ${shouldShowCompactMode ? 'mt-2 pt-2' : 'mt-4 pt-3'}
            `}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trophy className="h-3 w-3" />
                <span className="text-sm">
                  {isExpanded ? 'Hide' : 'View'} Detailed Timeline
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Collapsible Timeline Section */}
      {totalEvents > 0 && (
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded 
              ? 'max-h-screen opacity-100 animate-accordion-down' 
              : 'max-h-0 opacity-0 animate-accordion-up'
          }`}
        >
          <MirroredMatchTimeline
            goals={goals}
            cards={cards}
            processedEvents={processedEvents}
            homeTeamColor={homeTeamColor}
            awayTeamColor={awayTeamColor}
            getGoalPlayerName={getGoalPlayerName}
            getGoalTime={getGoalTime}
            getCardPlayerName={getCardPlayerName}
            getCardTime={getCardTime}
            getCardType={getCardType}
            isCardRed={isCardRed}
            fixture={fixture}
          />
        </div>
      )}
    </div>
  );
};

export default CollapsibleScoreBanner;
