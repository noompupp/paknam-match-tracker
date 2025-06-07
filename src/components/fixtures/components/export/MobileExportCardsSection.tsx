
import { Badge } from "@/components/ui/badge";

interface MobileExportCardsSectionProps {
  cards: any[];
}

const MobileExportCardsSection = ({ cards }: MobileExportCardsSectionProps) => {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-slate-25 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">!</span>
        </div>
        <h3 className="font-bold text-base text-slate-800">
          Disciplinary ({cards.length})
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {cards.slice(0, 4).map((card, index) => (
          <div 
            key={`card-${card.id}-${index}`} 
            className="flex items-center gap-3 p-2 bg-white rounded border"
          >
            <Badge 
              variant={card.type === 'red' ? 'destructive' : 'outline'}
              className="text-xs px-2 py-1 font-semibold"
            >
              {card.type?.toUpperCase()}
            </Badge>
            <span className="text-sm font-medium text-slate-700 truncate flex-1">
              {card.player || card.playerName}
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

export default MobileExportCardsSection;
