
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fixture } from "@/types/database";
import TeamLogo from "../teams/TeamLogo";

interface MatchSelectionProps {
  fixtures: Fixture[];
  selectedFixture: string;
  onFixtureChange: (value: string) => void;
}

const MatchSelection = ({ fixtures, selectedFixture, onFixtureChange }: MatchSelectionProps) => {
  // Sort fixtures chronologically (earliest scheduled first, then most recent completed)
  const sortedFixtures = fixtures?.slice().sort((a, b) => {
    const dateA = new Date(a.match_date || '');
    const dateB = new Date(b.match_date || '');
    
    // Scheduled fixtures first, then completed
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    
    // For scheduled fixtures, show earliest first
    if (a.status !== 'completed' && b.status !== 'completed') {
      return dateA.getTime() - dateB.getTime();
    }
    
    // For completed fixtures, show most recent first
    return dateB.getTime() - dateA.getTime();
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
                    <TeamLogo team={fixture.home_team} size="small" />
                    <span className="font-medium">{fixture.home_team?.name || 'TBD'}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium">{fixture.away_team?.name || 'TBD'}</span>
                    <TeamLogo team={fixture.away_team} size="small" />
                    <span className="text-xs text-muted-foreground ml-2">
                      ({new Date(fixture.match_date).toLocaleDateString()})
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ml-2 ${
                      fixture.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      fixture.status === 'live' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {fixture.status}
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
