
import TeamLogoDisplay from "../../TeamLogoDisplay";

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
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
      {/* Teams and Score Display */}
      <div className="flex items-center justify-between mb-6">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <div className="mb-4">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={displayHomeColor}
              size="lg"
              showName={false}
            />
          </div>
          <div className="text-lg font-bold text-white/90 mb-3 truncate px-2">
            {fixture.home_team?.name || 'Home'}
          </div>
          <div 
            className="text-7xl font-black leading-none mb-2 drop-shadow-2xl"
            style={{ 
              color: displayHomeColor,
              textShadow: '0 0 30px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            {fixture.home_score || 0}
          </div>
        </div>

        {/* VS Separator */}
        <div className="px-6 flex flex-col items-center">
          <div className="text-2xl font-light text-white/60 mb-2">VS</div>
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <div className="mb-4">
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={displayAwayColor}
              size="lg"
              showName={false}
            />
          </div>
          <div className="text-lg font-bold text-white/90 mb-3 truncate px-2">
            {fixture.away_team?.name || 'Away'}
          </div>
          <div 
            className="text-7xl font-black leading-none mb-2 drop-shadow-2xl"
            style={{ 
              color: displayAwayColor,
              textShadow: '0 0 30px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            {fixture.away_score || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryScoreline;
