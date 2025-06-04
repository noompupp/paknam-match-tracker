
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface CardsSummaryDisplayProps {
  selectedFixtureData: any;
  cards: any[];
  formatTime: (seconds: number) => string;
}

const CardsSummaryDisplay = ({
  selectedFixtureData,
  cards,
  formatTime
}: CardsSummaryDisplayProps) => {
  // Enhanced deduplication with more comprehensive unique key generation
  const createUniqueKey = (item: any, type: string) => {
    return `${type}-${item.playerId || item.player_id}-${item.time}-${item.type || item.card_type}-${item.team}`;
  };

  // Deduplicate cards with enhanced logic
  const uniqueCards = cards.filter((card, index, self) => {
    const currentKey = createUniqueKey(card, 'card');
    return index === self.findIndex(c => createUniqueKey(c, 'card') === currentKey);
  });

  console.log('🔍 Enhanced card deduplication results:', {
    originalCards: cards.length,
    uniqueCards: uniqueCards.length
  });

  const homeTeam = selectedFixtureData.home_team?.name || 'Home Team';
  const awayTeam = selectedFixtureData.away_team?.name || 'Away Team';

  const homeCards = uniqueCards.filter(card => card.team === homeTeam);
  const awayCards = uniqueCards.filter(card => card.team === awayTeam);

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
                    <Badge variant="outline" className={card.type === 'yellow' || card.card_type === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {(card.type || card.card_type) === 'yellow' ? 'Yellow' : 'Red'} Card
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
                    <Badge variant="outline" className={card.type === 'yellow' || card.card_type === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {(card.type || card.card_type) === 'yellow' ? 'Yellow' : 'Red'} Card
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
