
import IPhoneStoryHeader from "./IPhoneStoryHeader";
import IPhoneStoryGoals from "./IPhoneStoryGoals";
import IPhoneStoryCards from "./IPhoneStoryCards";
import IPhoneStoryTimeline from "./IPhoneStoryTimeline";
import IPhoneStoryFooter from "./IPhoneStoryFooter";

interface IPhoneStoryLayoutProps {
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

const IPhoneStoryLayout = ({
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
}: IPhoneStoryLayoutProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  return (
    <div 
      className="w-[375px] bg-white overflow-hidden shadow-xl flex flex-col"
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        height: '812px',
        aspectRatio: '375/812'
      }}
    >
      {/* Header Section - Fixed height */}
      <div className="flex-shrink-0">
        <IPhoneStoryHeader 
          fixture={fixture}
          homeTeamColor={homeTeamColor}
          awayTeamColor={awayTeamColor}
        />
      </div>

      {/* Content Area - Scrollable with optimized spacing */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Goals Section */}
        {goals.length > 0 && (
          <IPhoneStoryGoals
            goals={goals}
            homeGoals={homeGoals}
            awayGoals={awayGoals}
            homeTeamColor={homeTeamColor}
            awayTeamColor={awayTeamColor}
          />
        )}

        {/* Cards Section */}
        {cards.length > 0 && (
          <IPhoneStoryCards
            cards={cards}
            getCardPlayerName={getCardPlayerName}
            getCardTime={getCardTime}
            getCardType={getCardType}
            isCardRed={isCardRed}
          />
        )}

        {/* Timeline Section */}
        <IPhoneStoryTimeline
          timelineEvents={timelineEvents}
          formatTime={formatTime}
        />
      </div>

      {/* Footer Section - Fixed height */}
      <div className="flex-shrink-0 mt-auto">
        <IPhoneStoryFooter
          homeGoals={homeGoals}
          awayGoals={awayGoals}
          cards={cards}
          timelineEvents={timelineEvents}
          homeTeamColor={homeTeamColor}
          awayTeamColor={awayTeamColor}
          fixture={fixture}
        />
      </div>
    </div>
  );
};

export default IPhoneStoryLayout;
