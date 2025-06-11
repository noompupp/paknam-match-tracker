
import ImprovedMatchSelection from "./ImprovedMatchSelection";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";

interface RefereeToolsHeaderProps {
  fixtures: any[];
  selectedFixture: string;
  onFixtureChange: (value: string) => void;
  enhancedPlayersData: {
    hasValidData: boolean;
    dataIssues: string[];
  };
}

const RefereeToolsHeader = ({
  fixtures,
  selectedFixture,
  onFixtureChange,
  enhancedPlayersData
}: RefereeToolsHeaderProps) => {
  return (
    <div className="space-y-4">
      <UnifiedPageHeader 
        title="Referee Tools"
        logoSize="small"
        showLanguageToggle={true}
      />
      
      <div className="max-w-7xl mx-auto px-4">
        <ImprovedMatchSelection
          fixtures={fixtures}
          selectedFixture={selectedFixture}
          onFixtureChange={onFixtureChange}
          enhancedPlayersData={enhancedPlayersData}
        />
      </div>
    </div>
  );
};

export default RefereeToolsHeader;
