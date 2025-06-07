
interface SocialMediaStoryScorelineProps {
  fixture: any;
  displayHomeColor: string;
  displayAwayColor: string;
}

const SocialMediaStoryScoreline = ({
  fixture,
  displayHomeColor,
  displayAwayColor
}: SocialMediaStoryScorelineProps) => {
  return (
    <div className="text-center space-y-2">
      {/* Team Names and Score */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex-1 text-right">
          <div 
            className="text-lg font-bold truncate"
            style={{ color: displayHomeColor }}
          >
            {fixture?.home_team?.name || 'Home'}
          </div>
        </div>
        
        <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-[80px]">
          <div className="text-2xl font-bold text-gray-900">
            {fixture?.home_score || 0} - {fixture?.away_score || 0}
          </div>
        </div>
        
        <div className="flex-1 text-left">
          <div 
            className="text-lg font-bold truncate"
            style={{ color: displayAwayColor }}
          >
            {fixture?.away_team?.name || 'Away'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryScoreline;
