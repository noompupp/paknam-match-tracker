
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fixture } from "@/types/database";

interface MatchSelectionProps {
  fixtures: Fixture[];
  selectedFixture: string;
  onFixtureChange: (value: string) => void;
}

const MatchSelection = ({ fixtures, selectedFixture, onFixtureChange }: MatchSelectionProps) => {
  const upcomingFixtures = fixtures?.filter(f => f.status === 'scheduled') || [];

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle>Select Match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fixture">Choose Fixture</Label>
            <Select value={selectedFixture} onValueChange={onFixtureChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a fixture to manage" />
              </SelectTrigger>
              <SelectContent>
                {upcomingFixtures.map((fixture) => (
                  <SelectItem key={fixture.id} value={fixture.id.toString()}>
                    {fixture.home_team?.name} vs {fixture.away_team?.name} - {new Date(fixture.match_date).toLocaleDateString()} {fixture.match_time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchSelection;
