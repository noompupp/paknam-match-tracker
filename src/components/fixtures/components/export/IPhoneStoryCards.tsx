
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface IPhoneStoryCardsProps {
  cards: any[];
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const IPhoneStoryCards = ({ cards, getCardPlayerName, getCardTime, getCardType, isCardRed }: IPhoneStoryCardsProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  if (cards.length === 0) return null;

  return (
    <div className="px-4 py-4 bg-yellow-25 border-b border-yellow-100">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-3 w-3 text-white" />
        </div>
        <h3 className="font-semibold text-sm text-yellow-800 text-center">
          Disciplinary ({cards.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {cards.map((card, index) => {
          const cardType = getCardType(card);
          const isRed = isCardRed(card);
          
          return (
            <div 
              key={`card-${card.id}-${index}`}
              className={`flex items-center justify-between p-2 rounded border ${
                isRed 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">
                  {isRed ? '🟥' : '🟨'}
                </span>
                <span className="text-sm font-medium text-gray-800 truncate">
                  {getCardPlayerName(card)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant={isRed ? 'destructive' : 'outline'}
                  className={`text-xs px-1.5 py-0.5 font-medium ${
                    !isRed ? 'bg-yellow-500 text-white border-yellow-500' : ''
                  }`}
                >
                  {isRed ? 'RC' : 'YC'}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTime(getCardTime(card))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IPhoneStoryCards;
