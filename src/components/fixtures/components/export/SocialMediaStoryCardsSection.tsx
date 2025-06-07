
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
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">Cards</h3>
      <div className="space-y-1">
        {cards.map((card, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="truncate flex-1">
              {getCardPlayerName(card)}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">
                {formatTime(getCardTime(card))}
              </span>
              <div 
                className={`w-3 h-4 rounded-sm ${
                  isCardRed(card) ? 'bg-red-500' : 'bg-yellow-400'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaStoryCardsSection;
