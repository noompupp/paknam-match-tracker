
import ImprovedMatchSelection from "./ImprovedMatchSelection";

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
    <div className="container mx-auto p-4 border-b bg-background">
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
  );
};

export default RefereeToolsHeader;
