
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { getGoalAssistPlayerName } from "../utils/matchSummaryDataProcessor";
import { getSimplifiedCardType } from "@/utils/scoreColorUtils";
import EnhancedTimeBadge from "./EnhancedTimeBadge";

interface MatchEventsSectionProps {
  goals: any[];
  cards: any[];
  processedEvents: {
    homeGoals: any[];
    awayGoals: any[];
  };
  homeTeamColor: string;
  awayTeamColor: string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
  fixture: any;
}

const MatchEventsSection = ({
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
  isCardRed,
  fixture
}: MatchEventsSectionProps) => {
  // Combine and sort all events by time
  const allEvents = [
    ...goals.map(goal => ({
      type: 'goal',
      time: getGoalTime(goal),
      data: goal,
      isHome: processedEvents.homeGoals.includes(goal)
    })),
    ...cards.map(card => ({
      type: 'card',
      time: getCardTime(card),
      data: card,
      isHome: getCardTeamId(card) === fixture?.home_team_id
    }))
  ].sort((a, b) => a.time - b.time);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  return (
    <Card className="premier-card-shadow-lg match-border-gradient">
      <CardContent className="pt-6 match-gradient-events">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4" />
          Match Events ({allEvents.length})
        </h4>
        
        {allEvents.length === 0 ? (
          <div className="text-center py-8 timeline-gradient rounded-lg border border-muted/20 premier-card-shadow">
            <p className="text-sm text-muted-foreground">No events recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allEvents.map((event, index) => {
              const teamColor = event.isHome ? homeTeamColor : awayTeamColor;
              
              if (event.type === 'goal') {
                const playerName = getGoalPlayerName(event.data);
                // Enhanced own goal detection with comprehensive flag checking
                const isOwnGoal = !!(
                  event.data.own_goal || 
                  event.data.isOwnGoal || 
                  event.data.is_own_goal ||
                  (event.data.description && event.data.description.toLowerCase().includes('own goal'))
                );
                const assistName = !isOwnGoal ? getGoalAssistPlayerName(event.data) : undefined;
                
                console.log('🎯 MatchEventsSection - Processing goal event:', {
                  goalId: event.data.id,
                  player: playerName,
                  isOwnGoal,
                  assistName,
                  ownGoalFlags: {
                    own_goal: event.data.own_goal,
                    isOwnGoal: event.data.isOwnGoal,
                    is_own_goal: event.data.is_own_goal
                  }
                });
                
                return (
                  <div 
                    key={`event-goal-${event.data.id}-${index}`} 
                    className="flex items-center justify-between p-3 event-item-gradient rounded-lg border border-primary/10 premier-card-shadow hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: teamColor, boxShadow: `0 0 8px ${teamColor}40` }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span>{isOwnGoal ? '🔴' : '⚽'}</span>
                          <span>
                            {playerName}
                            {isOwnGoal && (
                              <span className="ml-1 text-red-600 font-medium">(OG)</span>
                            )}
                          </span>
                        </div>
                        {assistName && !isOwnGoal && (
                          <div className="text-xs text-muted-foreground italic mt-1">
                            Assist: {assistName}
                          </div>
                        )}
                      </div>
                    </div>
                    <EnhancedTimeBadge 
                      time={formatTime(event.time)} 
                      variant={isOwnGoal ? "red" : "goal"}
                    />
                  </div>
                );
              } else {
                const playerName = getCardPlayerName(event.data);
                const cardType = getSimplifiedCardType(event.data);
                const isRed = isCardRed(event.data);
                
                return (
                  <div 
                    key={`event-card-${event.data.id}-${index}`} 
                    className="flex items-center justify-between p-3 event-item-gradient rounded-lg border border-primary/10 premier-card-shadow hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: teamColor, boxShadow: `0 0 8px ${teamColor}40` }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span>{isRed ? '🟥' : '🟨'}</span>
                          <span>{playerName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cardType} Card
                        </div>
                      </div>
                    </div>
                    <EnhancedTimeBadge 
                      time={formatTime(event.time)} 
                      variant={isRed ? 'red' : 'yellow'}
                    />
                  </div>
                );
              }
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchEventsSection;
