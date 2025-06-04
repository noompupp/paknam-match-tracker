
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useEnhancedMatchSummary } from "@/hooks/useEnhancedMatchSummary";

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
  // Fetch database data if fixture ID is available
  const { data: enhancedData } = useEnhancedMatchSummary(fixtureId);
  
  // Use database data if available, fallback to local cards
  const cardsToDisplay = enhancedData?.cards.length ? enhancedData.cards : cards;

  // Enhanced deduplication with more comprehensive unique key generation
  const createUniqueKey = (item: any, type: string) => {
    return `${type}-${item.playerId || item.player_id}-${item.time}-${item.cardType || item.type || item.card_type}-${item.team}`;
  };

  // Deduplicate cards with enhanced logic
  const uniqueCards = cardsToDisplay.filter((card, index, self) => {
    const currentKey = createUniqueKey(card, 'card');
    return index === self.findIndex(c => createUniqueKey(c, 'card') === currentKey);
  });

  console.log('🔍 Enhanced card deduplication results:', {
    originalCards: cardsToDisplay.length,
    uniqueCards: uniqueCards.length,
    usingDatabase: !!enhancedData?.cards.length
  });

  const homeTeam = selectedFixtureData?.home_team?.name || selectedFixtureData?.home_team_id || 'Home Team';
  const awayTeam = selectedFixtureData?.away_team?.name || selectedFixtureData?.away_team_id || 'Away Team';

  const homeCards = uniqueCards.filter(card => 
    card.team === homeTeam || 
    card.team === selectedFixtureData?.home_team_id ||
    card.team === selectedFixtureData?.home_team?.name
  );
  const awayCards = uniqueCards.filter(card => 
    card.team === awayTeam || 
    card.team === selectedFixtureData?.away_team_id ||
    card.team === selectedFixtureData?.away_team?.name
  );

  if (uniqueCards.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Disciplinary Actions ({uniqueCards.length})
          <Badge variant="outline" className="ml-auto text-xs">
            Deduplicated
          </Badge>
          {enhancedData?.cards.length && (
            <Badge variant="default" className="bg-green-100 text-green-800">Database</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">{homeTeam}</h4>
            <div className="space-y-2">
              {homeCards.map((card, index) => (
                <div key={`home-card-${index}-${card.playerId || card.player_id}-${card.time}`} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <span className="font-medium">{card.playerName || card.player_name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={(card.cardType || card.type || card.card_type) === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {((card.cardType || card.type || card.card_type) === 'yellow' ? 'Yellow' : 'Red')} Card
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatTime(card.time)}</span>
                  </div>
                </div>
              ))}
              {homeCards.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No cards issued</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">{awayTeam}</h4>
            <div className="space-y-2">
              {awayCards.map((card, index) => (
                <div key={`away-card-${index}-${card.playerId || card.player_id}-${card.time}`} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <span className="font-medium">{card.playerName || card.player_name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={(card.cardType || card.type || card.card_type) === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {((card.cardType || card.type || card.card_type) === 'yellow' ? 'Yellow' : 'Red')} Card
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatTime(card.time)}</span>
                  </div>
                </div>
              ))}
              {awayCards.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No cards issued</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardsSummaryDisplay;
