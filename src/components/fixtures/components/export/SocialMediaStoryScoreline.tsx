
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
  // Enhanced color visibility for scores with better contrast
  const getScoreTextColor = (teamColor: string) => {
    // Use a darker shade of the team color for better readability
    if (!teamColor || teamColor === '#ffffff' || teamColor === '#FFFFFF') {
      return '#1e293b'; // slate-800 for white/missing colors
    }
    
    // For other colors, use a darker variant or add text shadow for visibility
    return teamColor;
  };

  return (
    <div className="text-center space-y-2">
      {/* Team Names and Score */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex-1 text-right">
          <div 
            className="text-lg font-bold truncate drop-shadow-sm"
            style={{ 
              color: getScoreTextColor(displayHomeColor),
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}
          >
            {fixture?.home_team?.name || 'Home'}
          </div>
        </div>
        
        <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-[80px] border border-gray-300">
          <div className="text-2xl font-bold text-gray-900">
            {fixture?.home_score || 0} - {fixture?.away_score || 0}
          </div>
        </div>
        
        <div className="flex-1 text-left">
          <div 
            className="text-lg font-bold truncate drop-shadow-sm"
            style={{ 
              color: getScoreTextColor(displayAwayColor),
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}
          >
            {fixture?.away_team?.name || 'Away'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryScoreline;
