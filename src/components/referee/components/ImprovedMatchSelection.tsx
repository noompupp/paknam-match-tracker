
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { sortFixturesChronologically, getMatchStatus, formatMatchDate, formatMatchTime } from "@/utils/fixtureDataProcessor";

interface ImprovedMatchSelectionProps {
  fixtures: any[];
  selectedFixture: string;
  onFixtureChange: (value: string) => void;
  enhancedPlayersData: {
    hasValidData: boolean;
    dataIssues: string[];
  };
}

const ImprovedMatchSelection = ({ 
  fixtures, 
  selectedFixture, 
  onFixtureChange,
  enhancedPlayersData 
}: ImprovedMatchSelectionProps) => {
  // Use the improved sorting utility
  const sortedFixtures = sortFixturesChronologically(fixtures);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Match</h3>
        {selectedFixture && (
          <Badge variant={enhancedPlayersData.hasValidData ? 'default' : 'destructive'}>
            {enhancedPlayersData.hasValidData ? 'Data Ready' : 'Data Issues'}
          </Badge>
        )}
      </div>

      <Select value={selectedFixture} onValueChange={onFixtureChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a match to referee..." />
        </SelectTrigger>
        <SelectContent className="max-h-80 overflow-y-auto bg-background border border-border shadow-lg">
          {sortedFixtures.map((fixture) => {
            const status = getMatchStatus(fixture);
            const homeTeam = fixture.home_team?.name || fixture.team1 || 'Home Team';
            const awayTeam = fixture.away_team?.name || fixture.team2 || 'Away Team';
            const score = (fixture.home_score !== null && fixture.away_score !== null) 
              ? `${fixture.home_score}-${fixture.away_score}` 
              : null;

            return (
              <SelectItem 
                key={fixture.id} 
                value={fixture.id.toString()}
                className="p-4 cursor-pointer hover:bg-muted/50 border-b border-border/50 last:border-b-0"
              >
                <div className="w-full space-y-2">
                  {/* Match teams and score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {homeTeam} vs {awayTeam}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {score && (
                        <Badge variant="outline" className="text-xs">
                          {score}
                        </Badge>
                      )}
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Match details */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatMatchDate(fixture.match_date || fixture.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏰</span>
                      <span>{formatMatchTime(fixture.time || '18:00')}</span>
                    </div>
                    {fixture.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-32">{fixture.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {enhancedPlayersData.dataIssues.length > 0 && selectedFixture && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900/10 dark:border-yellow-800">
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
            Data Issues Detected
          </div>
          <ul className="text-xs text-yellow-700 dark:text-yellow-500 space-y-1">
            {enhancedPlayersData.dataIssues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImprovedMatchSelection;
