
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

  const truncateTeamName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

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
                  <div className="flex items-center gap-2 py-1 w-full min-w-0">
                    <TeamLogo team={fixture.home_team} size="small" className="flex-shrink-0" />
                    <span className="font-medium truncate max-w-[4rem] sm:max-w-none">
                      {truncateTeamName(fixture.home_team?.name || 'TBD', 8)}
                    </span>
                    <span className="text-muted-foreground flex-shrink-0">vs</span>
                    <span className="font-medium truncate max-w-[4rem] sm:max-w-none">
                      {truncateTeamName(fixture.away_team?.name || 'TBD', 8)}
                    </span>
                    <TeamLogo team={fixture.away_team} size="small" className="flex-shrink-0" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 ml-auto flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(fixture.match_date).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                        fixture.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        fixture.status === 'live' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {fixture.status}
                      </span>
                    </div>
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
