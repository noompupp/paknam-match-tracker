
import SocialMediaStoryScoreline from "./SocialMediaStoryScoreline";
import SocialMediaStoryMatchInfo from "./SocialMediaStoryMatchInfo";
import SocialMediaStoryGoalsSection from "./SocialMediaStoryGoalsSection";
import SocialMediaStoryCardsSection from "./SocialMediaStoryCardsSection";
import SocialMediaStoryNoEvents from "./SocialMediaStoryNoEvents";

interface SocialMediaStoryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  homeGoals: any[];
  awayGoals: any[];
  displayHomeColor: string;
  displayAwayColor: string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
  formatTime: (seconds: number) => string;
}

const SocialMediaStoryContent = ({
  fixture,
  goals,
  cards,
  homeGoals,
  awayGoals,
  displayHomeColor,
  displayAwayColor,
  getCardPlayerName,
  getCardTime,
  isCardRed,
  formatTime
}: SocialMediaStoryContentProps) => {
  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      {/* Main Scoreline - Enhanced and Prominent */}
      <SocialMediaStoryScoreline
        fixture={fixture}
        displayHomeColor={displayHomeColor}
        displayAwayColor={displayAwayColor}
      />

      {/* Match Info - Compact */}
      <SocialMediaStoryMatchInfo fixture={fixture} />

      {/* Match Events - Goals and Cards with optimized spacing */}
      {(goals.length > 0 || cards.length > 0) ? (
        <div className="space-y-3 flex-1">
          {/* Goal Scorers */}
          <SocialMediaStoryGoalsSection
            goals={goals}
            homeGoals={homeGoals}
            awayGoals={awayGoals}
            fixture={fixture}
            displayHomeColor={displayHomeColor}
            displayAwayColor={displayAwayColor}
            formatTime={formatTime}
          />

          {/* Cards Section */}
          <SocialMediaStoryCardsSection
            cards={cards}
            getCardPlayerName={getCardPlayerName}
            getCardTime={getCardTime}
            isCardRed={isCardRed}
            formatTime={formatTime}
          />
        </div>
      ) : (
        /* No Events Placeholder */
        <div className="flex-1">
          <SocialMediaStoryNoEvents />
        </div>
      )}
    </div>
  );
};

export default SocialMediaStoryContent;
