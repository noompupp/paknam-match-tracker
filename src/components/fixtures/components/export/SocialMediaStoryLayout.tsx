
import SocialMediaStoryHeader from "./SocialMediaStoryHeader";
import SocialMediaStoryContent from "./SocialMediaStoryContent";
import SocialMediaStoryFooter from "./SocialMediaStoryFooter";
import SocialMediaStoryBackground from "./SocialMediaStoryBackground";
import SocialMediaStoryContainer from "./SocialMediaStoryContainer";
import { getDisplayColor, formatTime } from "./SocialMediaStoryColorUtils";

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
  const displayHomeColor = getDisplayColor(homeTeamColor, fixture.home_team?.name);
  const displayAwayColor = getDisplayColor(awayTeamColor, fixture.away_team?.name);

  return (
    <SocialMediaStoryContainer>
      <SocialMediaStoryBackground />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col bg-gradient-to-br from-background/95 to-background/90 dark:from-background/98 dark:to-background/95">
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
    </SocialMediaStoryContainer>
  );
};

export default SocialMediaStoryLayout;
