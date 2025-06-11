
import ImprovedMatchSelection from "./ImprovedMatchSelection";
import TournamentLogo from "@/components/TournamentLogo";
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
    <UnifiedPageHeader>
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <TournamentLogo />
          </div>
        </div>
        
        <ImprovedMatchSelection
          fixtures={fixtures}
          selectedFixture={selectedFixture}
          onFixtureChange={onFixtureChange}
          enhancedPlayersData={enhancedPlayersData}
        />
      </div>
    </UnifiedPageHeader>
  );
};

export default RefereeToolsHeader;
