
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileMatchHeader from "./MobileMatchHeader";
import DesktopMatchHeader from "./DesktopMatchHeader";
import MatchEventsSection from "./MatchEventsSection";
import EnhancedMatchEventsTimeline from "../../referee/components/EnhancedMatchEventsTimeline";

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
  timelineEvents,
  homeTeamColor,
  awayTeamColor,
  processedEvents,
  formatTime,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: CollapsibleScoreBannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const totalEvents = goals.length + cards.length;

  return (
    <Card className="overflow-hidden premier-card-shadow-lg match-border-gradient w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className={`${isMobile ? 'p-4' : 'p-6'} match-gradient-header w-full cursor-pointer hover:bg-muted/5 transition-colors`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isMobile ? (
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
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex items-center gap-1 text-xs md:text-sm">
                  <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{totalEvents} events</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )} />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-4 md:p-6 border-t">
            <div className="space-y-6">
              {/* Events Summary */}
              <MatchEventsSection
                goals={goals}
                cards={cards}
                processedEvents={processedEvents}
                homeTeamColor={homeTeamColor}
                awayTeamColor={awayTeamColor}
                getGoalPlayerName={getGoalPlayerName}
                getGoalTime={getGoalTime}
                getCardTeamId={getCardTeamId}
                getCardPlayerName={getCardPlayerName}
                getCardTime={getCardTime}
                getCardType={getCardType}
                isCardRed={isCardRed}
                fixture={fixture}
              />
              
              {/* Timeline */}
              {timelineEvents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Full Match Timeline
                  </h4>
                  <EnhancedMatchEventsTimeline
                    timelineEvents={timelineEvents}
                    formatTime={formatTime}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleScoreBanner;
