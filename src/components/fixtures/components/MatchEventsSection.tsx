
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { getGoalAssistPlayerName } from "../utils/matchSummaryDataProcessor";

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

  // Fixed card type function to return only the color without redundant "card" text
  const getSimplifiedCardType = (card: any) => {
    const cardType = getCardType(card);
    // Remove "card" from the end if it exists to prevent "YELLOW CARD card"
    return cardType?.replace(/\s*card$/i, '').toUpperCase() || 'YELLOW';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4" />
          Match Events ({allEvents.length})
        </h4>
        
        {allEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No events recorded</p>
        ) : (
          <div className="space-y-3">
            {allEvents.map((event, index) => {
              const teamColor = event.isHome ? homeTeamColor : awayTeamColor;
              
              if (event.type === 'goal') {
                const playerName = getGoalPlayerName(event.data);
                const assistName = getGoalAssistPlayerName(event.data);
                
                return (
                  <div 
                    key={`event-goal-${event.data.id}-${index}`} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: teamColor }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span>⚽</span>
                          <span>{playerName}</span>
                        </div>
                        {assistName && (
                          <div className="text-xs text-muted-foreground">
                            Assist: {assistName}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatTime(event.time)}
                    </Badge>
                  </div>
                );
              } else {
                const playerName = getCardPlayerName(event.data);
                const cardType = getSimplifiedCardType(event.data);
                const isRed = isCardRed(event.data);
                
                return (
                  <div 
                    key={`event-card-${event.data.id}-${index}`} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: teamColor }}
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
                    <Badge variant="outline" className="text-xs">
                      {formatTime(event.time)}
                    </Badge>
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
