
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface CardsSectionProps {
  cards: any[];
  homeCards: any[];
  awayCards: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const CardsSection = ({
  cards,
  homeCards,
  awayCards,
  homeTeamColor,
  awayTeamColor,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: CardsSectionProps) => {
  const [cardsExpanded, setCardsExpanded] = useState(false);

  const formatMatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  console.log('🟨 CardsSection: Received data:', {
    totalCards: cards.length,
    homeCards: homeCards.length,
    awayCards: awayCards.length,
    homeCardsData: homeCards,
    awayCardsData: awayCards
  });

  const hasCards = cards.length > 0;

  if (!hasCards) {
    console.log('🟨 CardsSection: No cards to display');
    return null;
  }

  return (
    <Collapsible open={cardsExpanded} onOpenChange={setCardsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between hover:bg-muted/50">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Disciplinary ({cards.length})
          </span>
          {cardsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              {/* Home Team Cards */}
              <div className="flex-1 pr-4">
                <div className="space-y-3">
                  {homeCards.map((card, index) => {
                    console.log('🟨 CardsSection: Rendering home card:', { card, index });
                    return (
                      <div key={`home-card-${card.id}-${index}`} className="text-left">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: homeTeamColor }}
                          />
                          <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="text-sm">
                            {getCardType(card)}
                          </Badge>
                          <span className="font-medium">{getCardPlayerName(card)}</span>
                          <span className="text-sm text-muted-foreground font-mono">
                            {formatMatchTime(getCardTime(card))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {homeCards.length === 0 && (
                    <div className="text-sm text-muted-foreground">No cards</div>
                  )}
                </div>
              </div>

              {/* Center Divider */}
              <div className="px-4">
                <div className="w-px h-full bg-border min-h-[30px]"></div>
              </div>

              {/* Away Team Cards */}
              <div className="flex-1 pl-4">
                <div className="space-y-3">
                  {awayCards.map((card, index) => {
                    console.log('🟨 CardsSection: Rendering away card:', { card, index });
                    return (
                      <div key={`away-card-${card.id}-${index}`} className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-sm text-muted-foreground font-mono">
                            {formatMatchTime(getCardTime(card))}
                          </span>
                          <span className="font-medium">{getCardPlayerName(card)}</span>
                          <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="text-sm">
                            {getCardType(card)}
                          </Badge>
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: awayTeamColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {awayCards.length === 0 && (
                    <div className="text-sm text-muted-foreground">No cards</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CardsSection;
