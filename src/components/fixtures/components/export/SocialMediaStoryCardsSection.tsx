
interface SocialMediaStoryCardsSectionProps {
  cards: any[];
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  isCardRed: (card: any) => boolean;
  formatTime: (seconds: number) => string;
}

const SocialMediaStoryCardsSection = ({
  cards,
  getCardPlayerName,
  getCardTime,
  isCardRed,
  formatTime
}: SocialMediaStoryCardsSectionProps) => {
  if (cards.length === 0) return null;

  return (
    <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-5 border border-amber-400/30 shadow-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-amber-100 flex items-center justify-center gap-2">
          <span className="text-xl">🟨</span>
          Disciplinary Actions ({cards.length})
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto">
        {cards.slice(0, 4).map((card, index) => {
          const playerName = getCardPlayerName(card);
          const isRed = isCardRed(card);
          const time = getCardTime(card);
          
          return (
            <div 
              key={`card-${card.id}-${index}`} 
              className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">{isRed ? '🟥' : '🟨'}</span>
                <span className="text-sm font-semibold text-white truncate">
                  {playerName}
                </span>
              </div>
              <div className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded">
                {formatTime(time)}
              </div>
            </div>
          );
        })}
        
        {cards.length > 4 && (
          <div className="text-center p-2 bg-white/10 rounded-lg border border-white/20">
            <span className="text-xs text-amber-200 font-medium">
              +{cards.length - 4} more cards
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaStoryCardsSection;
