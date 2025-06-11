
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileMatchHeader from "./MobileMatchHeader";
import DesktopMatchHeader from "./DesktopMatchHeader";
import CompactGoalScorers from "./CompactGoalScorers";

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
  getGoalTime
}: CollapsibleScoreBannerProps) => {
  const isMobile = useIsMobile();
  const totalEvents = goals.length + cards.length;

  return (
    <Card className="overflow-hidden premier-card-shadow-lg match-border-gradient w-full">
      <div className={`${isMobile ? 'p-4' : 'p-6'} match-gradient-header w-full`}>
        {/* Score Display */}
        <div className="flex-1 mb-4">
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

        {/* Compact Goal Scorers and Events Summary */}
        {totalEvents > 0 && (
          <div className="mt-4 pt-4 border-t border-border/20">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Home Team Goals */}
              {processedEvents.homeGoals.length > 0 && (
                <div>
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
                <div>
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
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">
                  {cards.length} disciplinary action{cards.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Event Count */}
            <div className="flex items-center justify-center mt-3 pt-3 border-t border-border/10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Trophy className="h-3 w-3" />
                <span>{totalEvents} total events</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CollapsibleScoreBanner;
