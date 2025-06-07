
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface PremierLeagueCardsSectionProps {
  cards: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
  fixture: any;
}

const PremierLeagueCardsSection = ({
  cards,
  homeTeamColor,
  awayTeamColor,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed,
  fixture
}: PremierLeagueCardsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  // Separate cards by team
  const homeCards = cards.filter(card => getCardTeamId(card) === fixture?.home_team_id);
  const awayCards = cards.filter(card => getCardTeamId(card) === fixture?.away_team_id);

  if (cards.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between hover:bg-muted/50 border-amber-200 hover:border-amber-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="font-medium">Disciplinary Actions ({cards.length})</span>
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-3">
        <div className="bg-white border border-amber-200 rounded-lg p-4 space-y-4">
          {/* Home Team Cards */}
          {homeCards.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: homeTeamColor }}
                />
                {fixture.home_team?.name || 'Home'} ({homeCards.length})
              </h5>
              <div className="space-y-2">
                {homeCards.map((card, index) => (
                  <div 
                    key={`home-card-${card.id}-${index}`}
                    className="flex items-center justify-between p-2.5 bg-amber-50 rounded border border-amber-200"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={isCardRed(card) ? 'destructive' : 'outline'}
                        className="text-xs font-semibold"
                      >
                        {getCardType(card)?.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-sm">
                        {getCardPlayerName(card)}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-white px-2 py-1 rounded border">
                      {formatTime(getCardTime(card))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Away Team Cards */}
          {awayCards.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: awayTeamColor }}
                />
                {fixture.away_team?.name || 'Away'} ({awayCards.length})
              </h5>
              <div className="space-y-2">
                {awayCards.map((card, index) => (
                  <div 
                    key={`away-card-${card.id}-${index}`}
                    className="flex items-center justify-between p-2.5 bg-amber-50 rounded border border-amber-200"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={isCardRed(card) ? 'destructive' : 'outline'}
                        className="text-xs font-semibold"
                      >
                        {getCardType(card)?.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-sm">
                        {getCardPlayerName(card)}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-white px-2 py-1 rounded border">
                      {formatTime(getCardTime(card))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PremierLeagueCardsSection;
