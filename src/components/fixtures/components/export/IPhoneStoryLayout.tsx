
import IPhoneStoryHeader from "./IPhoneStoryHeader";
import IPhoneStoryGoals from "./IPhoneStoryGoals";
import IPhoneStoryCards from "./IPhoneStoryCards";
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
  return (
    <div 
      className="w-[375px] bg-white overflow-hidden shadow-xl flex flex-col"
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        height: '667px',
        aspectRatio: '9/16'
      }}
    >
      {/* Header Section */}
      <IPhoneStoryHeader 
        fixture={fixture}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
      />

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Goals Section */}
        <IPhoneStoryGoals
          goals={goals}
          homeGoals={homeGoals}
          awayGoals={awayGoals}
          homeTeamColor={homeTeamColor}
          awayTeamColor={awayTeamColor}
        />

        {/* Cards Section */}
        <IPhoneStoryCards
          cards={cards}
          getCardPlayerName={getCardPlayerName}
          getCardTime={getCardTime}
          getCardType={getCardType}
          isCardRed={isCardRed}
        />
      </div>

      {/* Footer Section */}
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
  );
};

export default IPhoneStoryLayout;
