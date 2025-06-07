
import { Badge } from "@/components/ui/badge";

interface IPhoneStoryCardsProps {
  cards: any[];
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const IPhoneStoryCards = ({
  cards,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: IPhoneStoryCardsProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  if (cards.length === 0) return null;

  return (
    <div className="px-4 py-4 bg-slate-25 border-t border-slate-100">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">!</span>
        </div>
        <h3 className="font-bold text-base text-slate-800 text-center">
          Disciplinary ({cards.length})
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {cards.slice(0, 4).map((card, index) => (
          <div 
            key={`card-${card.id}-${index}`} 
            className="flex items-center justify-between p-2 bg-white rounded border"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Badge 
                variant={isCardRed(card) ? 'destructive' : 'outline'}
                className="text-xs px-2 py-1 font-semibold"
              >
                {getCardType(card)?.toUpperCase()}
              </Badge>
              <span className="text-sm font-medium text-slate-700 truncate flex-1 text-center">
                {getCardPlayerName(card)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {formatTime(getCardTime(card))}
            </span>
          </div>
        ))}
      </div>
      
      {cards.length > 4 && (
        <div className="text-center mt-3 p-2 bg-white rounded border">
          <span className="text-xs text-slate-500 font-medium">
            +{cards.length - 4} more disciplinary actions
          </span>
        </div>
      )}
    </div>
  );
};

export default IPhoneStoryCards;
