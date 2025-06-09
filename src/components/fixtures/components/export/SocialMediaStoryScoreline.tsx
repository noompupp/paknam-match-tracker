
import { getNeutralScoreStyle } from "@/utils/scoreColorUtils";

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
            className="text-lg font-semibold truncate"
            style={getNeutralScoreStyle()}
          >
            {fixture?.home_team?.name || 'Home'}
          </div>
        </div>
        
        <div className="px-4 py-2 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg min-w-[80px] border border-border">
          <div className="text-2xl font-bold text-foreground">
            {fixture?.home_score || 0} - {fixture?.away_score || 0}
          </div>
        </div>
        
        <div className="flex-1 text-left">
          <div 
            className="text-lg font-semibold truncate"
            style={getNeutralScoreStyle()}
          >
            {fixture?.away_team?.name || 'Away'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryScoreline;
