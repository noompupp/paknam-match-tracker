
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface DisciplinaryActionsSectionProps {
  selectedFixtureData: any;
  cards: any[];
  formatTime: (seconds: number) => string;
}

const DisciplinaryActionsSection = ({
  selectedFixtureData,
  cards,
  formatTime
}: DisciplinaryActionsSectionProps) => {
  const homeCards = cards.filter(c => c.team === selectedFixtureData?.home_team?.name);
  const awayCards = cards.filter(c => c.team === selectedFixtureData?.away_team?.name);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Disciplinary Actions ({cards.length})
      </h4>
      
      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No cards issued</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Cards */}
          <div>
            <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.home_team?.name}</h5>
            <div className="space-y-1">
              {homeCards.map((card, index) => (
                <div key={index} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={card.type === 'red' ? 'destructive' : 'outline'}>
                      {card.type}
                    </Badge>
                    <span className="font-medium">{card.player}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(card.time)}</span>
                </div>
              ))}
              {homeCards.length === 0 && (
                <p className="text-xs text-muted-foreground">No cards</p>
              )}
            </div>
          </div>

          {/* Away Cards */}
          <div>
            <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.away_team?.name}</h5>
            <div className="space-y-1">
              {awayCards.map((card, index) => (
                <div key={index} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={card.type === 'red' ? 'destructive' : 'outline'}>
                      {card.type}
                    </Badge>
                    <span className="font-medium">{card.player}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(card.time)}</span>
                </div>
              ))}
              {awayCards.length === 0 && (
                <p className="text-xs text-muted-foreground">No cards</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplinaryActionsSection;
