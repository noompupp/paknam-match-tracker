
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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
      {/* Enhanced Team vs Team Layout */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-white mb-2 truncate">
            {fixture.home_team?.name || 'Home'}
          </div>
          <div 
            className="text-4xl font-black drop-shadow-lg"
            style={{ color: displayHomeColor }}
          >
            {fixture.home_score || 0}
          </div>
        </div>

        {/* VS Separator with enhanced styling */}
        <div className="px-4">
          <div className="text-2xl font-bold text-white/80 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
            VS
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-white mb-2 truncate">
            {fixture.away_team?.name || 'Away'}
          </div>
          <div 
            className="text-4xl font-black drop-shadow-lg"
            style={{ color: displayAwayColor }}
          >
            {fixture.away_score || 0}
          </div>
        </div>
      </div>

      {/* Match Status */}
      {fixture.status && (
        <div className="text-center mt-4">
          <div className="text-sm font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-lg inline-block">
            {fixture.status === 'completed' ? 'Full Time' : fixture.status}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaStoryScoreline;
