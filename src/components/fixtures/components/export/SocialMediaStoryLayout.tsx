
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

  // Ensure white teams get a visible color
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
      className="w-[375px] bg-white overflow-hidden shadow-xl flex flex-col"
      style={{ 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: '812px',
        aspectRatio: '375/812'
      }}
    >
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
  );
};

export default SocialMediaStoryLayout;
