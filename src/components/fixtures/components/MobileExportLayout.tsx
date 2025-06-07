
import MobileExportHeader from "./export/MobileExportHeader";
import MobileExportGoalsSection from "./export/MobileExportGoalsSection";
import MobileExportCardsSection from "./export/MobileExportCardsSection";
import MobileExportFooter from "./export/MobileExportFooter";

interface MobileExportLayoutProps {
  fixture: any;
  goals: any[];
  cards: any[];
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
}

const MobileExportLayout = ({
  fixture,
  goals,
  cards,
  homeGoals,
  awayGoals,
  homeTeamColor,
  awayTeamColor
}: MobileExportLayoutProps) => {
  return (
    <div 
      className="w-[375px] bg-white overflow-hidden shadow-xl"
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minHeight: '600px',
        maxHeight: '667px'
      }}
    >
      <MobileExportHeader
        fixture={fixture}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
      />

      <MobileExportGoalsSection
        goals={goals}
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        homeTeamColor={homeTeamColor}
        awayTeamColor={awayTeamColor}
      />

      <MobileExportCardsSection cards={cards} />

      <MobileExportFooter />
    </div>
  );
};

export default MobileExportLayout;
