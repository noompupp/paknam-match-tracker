
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
  const getTeamLogo = (team: any) => {
    return team?.logoURL || team?.logo || '⚽';
  };

  // Sort fixtures by __id__ field as specified in the plan
  const sortedFixtures = fixtures?.slice().sort((a, b) => {
    const aId = a.__id__ || a.id?.toString() || '0';
    const bId = b.__id__ || b.id?.toString() || '0';
    return aId.localeCompare(bId);
  }) || [];

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle>Select Match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label htmlFor="fixtureSelect">Choose a fixture to referee</Label>
          <Select value={selectedFixture} onValueChange={onFixtureChange}>
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Select a match" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg max-h-60 z-50">
              {sortedFixtures.map((fixture) => (
                <SelectItem 
                  key={fixture.id} 
                  value={fixture.id.toString()}
                  className="hover:bg-accent focus:bg-accent cursor-pointer"
                >
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-lg">{getTeamLogo(fixture.home_team)}</span>
                    <span className="font-medium">{fixture.home_team?.name || 'TBD'}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium">{fixture.away_team?.name || 'TBD'}</span>
                    <span className="text-lg">{getTeamLogo(fixture.away_team)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({new Date(fixture.match_date).toLocaleDateString()})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchSelection;
