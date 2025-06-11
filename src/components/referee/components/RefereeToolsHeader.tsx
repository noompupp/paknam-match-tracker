
import ImprovedMatchSelection from "./ImprovedMatchSelection";
import StickyBackground from "@/components/shared/StickyBackground";

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
    <StickyBackground variant="header" className="border-b mobile-safe-header">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Referee Tools</h1>
            <p className="text-muted-foreground">Manage match events, player tracking, and scores</p>
          </div>
          
          <ImprovedMatchSelection
            fixtures={fixtures}
            selectedFixture={selectedFixture}
            onFixtureChange={onFixtureChange}
            enhancedPlayersData={enhancedPlayersData}
          />
        </div>
      </div>
    </StickyBackground>
  );
};

export default RefereeToolsHeader;
