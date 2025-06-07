
interface SocialMediaStoryFooterProps {
  homeGoals: any[];
  awayGoals: any[];
  cards: any[];
  displayHomeColor: string;
  displayAwayColor: string;
}

const SocialMediaStoryFooter = ({
  homeGoals,
  awayGoals,
  cards,
  displayHomeColor,
  displayAwayColor
}: SocialMediaStoryFooterProps) => {
  const totalEvents = homeGoals.length + awayGoals.length + cards.length;

  return (
    <div className="p-4 bg-gray-50 text-center">
      <div className="text-xs text-gray-500">
        {totalEvents > 0 ? (
          `${totalEvents} match events`
        ) : (
          'No events recorded'
        )}
      </div>
    </div>
  );
};

export default SocialMediaStoryFooter;
