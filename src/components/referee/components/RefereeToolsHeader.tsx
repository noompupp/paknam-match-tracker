
import { Calendar, MapPin, AlertTriangle } from "lucide-react";
import RefereeCard from "../shared/RefereeCard";
import RefereeFormField from "../shared/RefereeFormField";
import TournamentLogo from "../../TournamentLogo";
import MobileOptimizedFixtureSelect from "./MobileOptimizedFixtureSelect";
import { useIsMobile } from "@/hooks/use-mobile";

interface RefereeToolsHeaderProps {
  fixtures: any[];
  selectedFixture: string;
  onFixtureChange: (fixtureId: string) => void;
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
  const isMobile = useIsMobile();
  const selectedFixtureData = fixtures.find(f => f.id.toString() === selectedFixture);

  return (
    <>
      {/* Standardized Header */}
      <div 
        className="border-b"
        style={{
          background: 'var(--header-background)',
          backdropFilter: 'var(--header-backdrop-blur)',
          borderColor: 'var(--header-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TournamentLogo />
              <h1 className="text-3xl font-bold text-foreground">Referee Tools</h1>
            </div>
            <p className="text-muted-foreground">Match management and live scoring</p>
          </div>
        </div>
      </div>

      {/* Fixture Selection Card */}
      <div className="container mx-auto p-4">
        <RefereeCard
          title="Match Selection"
          icon={<Calendar className="h-5 w-5" />}
          subtitle="Select a fixture to begin match management"
        >
          <div className="space-y-4">
            <RefereeFormField
              label="Select Fixture"
              description="Choose the match you want to manage"
              required
            >
              {isMobile ? (
                <MobileOptimizedFixtureSelect
                  fixtures={fixtures}
                  selectedFixture={selectedFixture}
                  onFixtureChange={onFixtureChange}
                  placeholder="Choose a fixture..."
                  className="mobile-fixture-select"
                />
              ) : (
                // Keep existing desktop select for larger screens
                <select
                  value={selectedFixture}
                  onChange={(e) => onFixtureChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Choose a fixture...</option>
                  {fixtures.map((fixture) => (
                    <option key={fixture.id} value={fixture.id.toString()}>
                      {fixture.home_team?.name || 'Home'} vs {fixture.away_team?.name || 'Away'}
                    </option>
                  ))}
                </select>
              )}
            </RefereeFormField>

            {selectedFixtureData && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">{selectedFixtureData.home_team?.name}</span>
                  {' vs '}
                  <span className="font-medium">{selectedFixtureData.away_team?.name}</span>
                </span>
              </div>
            )}

            {!enhancedPlayersData.hasValidData && enhancedPlayersData.dataIssues.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/10 dark:border-orange-800">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-orange-800 dark:text-orange-400 mb-1">
                    Data Issues Detected
                  </div>
                  <ul className="text-orange-700 dark:text-orange-500 space-y-1">
                    {enhancedPlayersData.dataIssues.map((issue, index) => (
                      <li key={index} className="text-xs">• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </RefereeCard>
      </div>
    </>
  );
};

export default RefereeToolsHeader;
