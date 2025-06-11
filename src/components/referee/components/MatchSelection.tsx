
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fixture } from "@/types/database";
import TeamLogo from "../../teams/TeamLogo";
import { sortFixturesChronologically, getMatchStatus } from "@/utils/fixtureDataProcessor";

interface MatchSelectionProps {
  fixtures: Fixture[];
  selectedFixture: string;
  onFixtureChange: (value: string) => void;
}

const MatchSelection = ({ fixtures, selectedFixture, onFixtureChange }: MatchSelectionProps) => {
  // Use the improved sorting utility
  const sortedFixtures = sortFixturesChronologically(fixtures);

  const truncateTeamName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  return (
    <Card className="card-shadow-lg mobile-referee-portrait">
      <CardHeader>
        <CardTitle>Select Match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label htmlFor="fixtureSelect">Choose a fixture to referee</Label>
          <Select value={selectedFixture} onValueChange={onFixtureChange}>
            <SelectTrigger className="bg-background border-input referee-select-dropdown select-trigger">
              <SelectValue placeholder="Select a match" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg max-h-60 z-[100] mobile-select-content">
              {sortedFixtures.map((fixture) => {
                const status = getMatchStatus(fixture);
                
                return (
                  <SelectItem 
                    key={fixture.id} 
                    value={fixture.id.toString()}
                    className="hover:bg-accent focus:bg-accent cursor-pointer mobile-select-item"
                  >
                    <div className="flex items-center gap-2 py-1 w-full min-w-0 team-info">
                      <TeamLogo team={fixture.home_team} size="small" className="flex-shrink-0" />
                      <span className="font-medium truncate max-w-[4rem] sm:max-w-none team-name">
                        {truncateTeamName(fixture.home_team?.name || 'TBD', 8)}
                      </span>
                      <span className="text-muted-foreground flex-shrink-0">vs</span>
                      <span className="font-medium truncate max-w-[4rem] sm:max-w-none team-name">
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
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchSelection;
