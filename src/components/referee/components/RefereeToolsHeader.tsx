
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, AlertTriangle } from "lucide-react";
import RefereeCard from "../shared/RefereeCard";
import RefereeFormField, { RefereeSelect } from "../shared/RefereeFormField";

interface RefereeToolsHeaderProps {
  fixtures: any[];
  selectedFixture: number | null;
  onFixtureChange: (fixtureId: number) => void;
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
  const fixtureOptions = fixtures.map(fixture => ({
    value: String(fixture.id),
    label: `${fixture.home_team?.name || 'Home'} vs ${fixture.away_team?.name || 'Away'}`,
    disabled: false
  }));

  const selectedFixtureData = fixtures.find(f => f.id === selectedFixture);

  const handleFixtureChange = (value: string) => {
    onFixtureChange(Number(value));
  };

  return (
    <RefereeCard
      title="Referee Tools"
      icon={<Calendar className="h-5 w-5" />}
      subtitle="Select a fixture to begin match management"
    >
      <div className="space-y-4">
        <RefereeFormField
          label="Select Fixture"
          description="Choose the match you want to manage"
          required
        >
          <RefereeSelect
            placeholder="Choose a fixture..."
            value={selectedFixture ? String(selectedFixture) : ""}
            onValueChange={handleFixtureChange}
            options={fixtureOptions}
          />
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
  );
};

export default RefereeToolsHeader;
