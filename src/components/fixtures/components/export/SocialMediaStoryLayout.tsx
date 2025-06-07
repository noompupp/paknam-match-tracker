
import SocialMediaStoryHeader from "./SocialMediaStoryHeader";
import SocialMediaStoryContent from "./SocialMediaStoryContent";
import SocialMediaStoryFooter from "./SocialMediaStoryFooter";

interface SocialMediaStoryLayoutProps {
  fixture: any;
  goals: any[];
  cards: any[];
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  timelineEvents: any[];
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const SocialMediaStoryLayout = ({
  fixture,
  goals,
  cards,
  homeGoals,
  awayGoals,
  homeTeamColor,
  awayTeamColor,
  timelineEvents,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: SocialMediaStoryLayoutProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  // Ensure white teams get a visible color with improved contrast
  const getDisplayColor = (color: string, teamName: string) => {
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white' || color === '#fff') {
      return '#1e293b'; // slate-800
    }
    return color;
  };

  const displayHomeColor = getDisplayColor(homeTeamColor, fixture.home_team?.name);
  const displayAwayColor = getDisplayColor(awayTeamColor, fixture.away_team?.name);

  return (
    <div 
      className="w-[540px] bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden shadow-2xl flex flex-col relative"
      style={{ 
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: '960px',
        aspectRatio: '9/16'
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-indigo-900/95" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        <SocialMediaStoryHeader fixture={fixture} />
        
        <SocialMediaStoryContent
          fixture={fixture}
          goals={goals}
          cards={cards}
          homeGoals={homeGoals}
          awayGoals={awayGoals}
          displayHomeColor={displayHomeColor}
          displayAwayColor={displayAwayColor}
          getCardPlayerName={getCardPlayerName}
          getCardTime={getCardTime}
          getCardType={getCardType}
          isCardRed={isCardRed}
          formatTime={formatTime}
        />
        
        <SocialMediaStoryFooter
          homeGoals={homeGoals}
          awayGoals={awayGoals}
          cards={cards}
          displayHomeColor={displayHomeColor}
          displayAwayColor={displayAwayColor}
        />
      </div>
    </div>
  );
};

export default SocialMediaStoryLayout;
