
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, AlertTriangle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { enhancedMatchSummaryService } from '@/services/fixtures/enhancedMatchSummaryService';

interface CardsSummaryDisplayProps {
  selectedFixtureData: any;
  cards: any[];
  formatTime: (seconds: number) => string;
  fixtureId?: number;
}

const CardsSummaryDisplay = ({
  selectedFixtureData,
  cards,
  formatTime,
  fixtureId
}: CardsSummaryDisplayProps) => {
  // Fetch enhanced database data if fixture ID is available
  const { data: enhancedData } = useQuery({
    queryKey: ['enhancedCardsSummary', fixtureId],
    queryFn: () => enhancedMatchSummaryService.getEnhancedMatchSummary(fixtureId!),
    enabled: !!fixtureId,
    staleTime: 30 * 1000
  });
  
  // Use enhanced database data if available, fallback to local cards
  const cardsToDisplay = enhancedData?.cards.length ? enhancedData.cards : cards;

  // Enhanced deduplication with comprehensive unique key generation
  const createUniqueKey = (item: any, index: number) => {
    const playerId = item.playerId || item.player_id || 'unknown';
    const time = item.time || item.event_time || 0;
    const cardType = item.cardType || item.type || item.card_type || 'unknown';
    const team = item.team || item.teamId || 'unknown';
    return `card-${playerId}-${time}-${cardType}-${team}-${index}`;
  };

  // Deduplicate cards with enhanced logic
  const uniqueCards = cardsToDisplay.filter((card, index, self) => {
    const currentKey = createUniqueKey(card, index);
    return index === self.findIndex((c, i) => createUniqueKey(c, i) === currentKey);
  });

  console.log('🔍 Enhanced card deduplication results:', {
    originalCards: cardsToDisplay.length,
    uniqueCards: uniqueCards.length,
    usingEnhancedData: !!enhancedData?.cards.length
  });

  const homeTeamId = selectedFixtureData?.home_team_id || selectedFixtureData?.home_team?.id;
  const awayTeamId = selectedFixtureData?.away_team_id || selectedFixtureData?.away_team?.id;
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  const homeCards = uniqueCards.filter(card => 
    card.team === homeTeamName || 
    card.team === homeTeamId ||
    card.teamId === homeTeamId
  );
  
  const awayCards = uniqueCards.filter(card => 
    card.team === awayTeamName || 
    card.team === awayTeamId ||
    card.teamId === awayTeamId
  );

  if (uniqueCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Disciplinary Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No disciplinary actions recorded</p>
        </CardContent>
      </Card>
    );
  }

  const renderCardsList = (teamCards: any[], teamName: string) => {
    if (teamCards.length === 0) {
      return <p className="text-sm text-muted-foreground italic">No cards issued to {teamName.toLowerCase()}</p>;
    }

    return (
      <div className="space-y-3">
        {teamCards.map((card, index) => {
          const uniqueKey = createUniqueKey(card, index);
          const displayName = card.playerName || card.player_name || 'Unknown Player';
          const cardType = card.cardType || card.type || card.card_type || 'yellow';
          const eventTime = card.time || card.event_time || 0;
          
          return (
            <div key={uniqueKey} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={cardType === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-red-100 text-red-800 border-red-300'}
                >
                  {cardType === 'yellow' ? '🟨' : '🟥'} {cardType.charAt(0).toUpperCase() + cardType.slice(1)}
                </Badge>
                <div>
                  <div className="font-medium">{displayName}</div>
                  {card.timestamp && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(card.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {formatTime(eventTime)}
                </Badge>
                {enhancedData && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    DB
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const yellowCards = uniqueCards.filter(c => (c.cardType || c.type) === 'yellow').length;
  const redCards = uniqueCards.filter(c => (c.cardType || c.type) === 'red').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Disciplinary Actions
          <div className="flex gap-2 ml-auto">
            <Badge variant="outline" className="bg-yellow-50">🟨 {yellowCards}</Badge>
            <Badge variant="outline" className="bg-red-50">🟥 {redCards}</Badge>
            {enhancedData?.cards.length && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Enhanced Data
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {homeTeamName}
              <Badge variant="secondary">{homeCards.length}</Badge>
            </h4>
            {renderCardsList(homeCards, homeTeamName)}
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {awayTeamName}
              <Badge variant="secondary">{awayCards.length}</Badge>
            </h4>
            {renderCardsList(awayCards, awayTeamName)}
          </div>
        </div>

        {/* Enhanced Statistics Summary */}
        {enhancedData?.summary && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-lg text-blue-600">{enhancedData.summary.homeTeamCards}</div>
                <div className="text-muted-foreground">Home Team Cards</div>
              </div>
              <div>
                <div className="font-bold text-lg text-red-600">{enhancedData.summary.awayTeamCards}</div>
                <div className="text-muted-foreground">Away Team Cards</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardsSummaryDisplay;
