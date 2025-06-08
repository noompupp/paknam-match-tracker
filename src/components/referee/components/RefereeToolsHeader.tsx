
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import MatchSelection from "../MatchSelection";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">Referee Tools</h1>
      
      <MatchSelection
        fixtures={fixtures || []}
        selectedFixture={selectedFixture}
        onFixtureChange={onFixtureChange}
      />

      {/* Data validation alerts */}
      {selectedFixture && !enhancedPlayersData.hasValidData && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p>Issues detected with player data:</p>
              <ul className="list-disc list-inside text-sm">
                {enhancedPlayersData.dataIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RefereeToolsHeader;
