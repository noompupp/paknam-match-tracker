
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
    <div className="bg-amber-500/15 backdrop-blur-md rounded-2xl p-4 border border-amber-400/25 shadow-lg">
      {/* Compact Header */}
      <div className="text-center mb-3">
        <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <span className="text-xl">🟨</span>
          Cards ({cards.length})
        </h2>
      </div>
      
      {/* Compact Card List */}
      <div className="space-y-2">
        {cards.map((card, index) => {
          const playerName = getCardPlayerName(card);
          const time = getCardTime(card);
          const isRed = isCardRed(card);
          
          return (
            <div 
              key={`card-${card.id}-${index}`} 
              className="p-2.5 bg-white/8 rounded-xl border border-white/15 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-4 h-4 rounded ${isRed ? 'bg-red-500' : 'bg-yellow-400'} flex-shrink-0`} />
                <span className="text-sm font-bold text-white truncate">
                  {playerName}
                </span>
              </div>
              <span className="text-xs font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-lg flex-shrink-0">
                {formatTime(time)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaStoryCardsSection;
