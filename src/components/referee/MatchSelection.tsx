
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Fixture } from "@/types/database";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
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

  const formatMatchDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatMatchTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeStr;
    }
  };

  const getStatusBadge = (fixture: Fixture) => {
    if (fixture.status === 'completed') return { label: 'Completed', variant: 'secondary' as const };
    if (fixture.status === 'live') return { label: 'Live', variant: 'destructive' as const };
    return { label: 'Scheduled', variant: 'outline' as const };
  };

  return (
    <Card className="referee-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Match Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="referee-form-field">
          <Label htmlFor="fixture" className="text-sm font-medium">
            Select Fixture
          </Label>
          <Select value={selectedFixture} onValueChange={onFixtureChange}>
            <SelectTrigger id="fixture" className="referee-select referee-focus h-auto min-h-[44px]">
              <SelectValue placeholder="Choose a match to manage..." />
            </SelectTrigger>
            <SelectContent className="max-h-80 overflow-y-auto bg-background border border-border shadow-lg z-50">
              {sortedFixtures.map((fixture) => {
                const status = getStatusBadge(fixture);
                const homeTeam = fixture.home_team?.name || 'Home Team';
                const awayTeam = fixture.away_team?.name || 'Away Team';
                const hasScore = fixture.home_score !== null && fixture.away_score !== null;

                return (
                  <SelectItem 
                    key={fixture.id} 
                    value={fixture.id.toString()}
                    className="p-4 cursor-pointer referee-interactive border-b border-border/50 last:border-b-0"
                  >
                    <div className="w-full space-y-3">
                      {/* Teams and Score */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-medium text-foreground truncate">
                              {truncateTeamName(homeTeam, 10)}
                            </span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="font-medium text-foreground truncate">
                              {truncateTeamName(awayTeam, 10)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {hasScore && (
                            <Badge variant="outline" className="text-xs font-bold">
                              {fixture.home_score}-{fixture.away_score}
                            </Badge>
                          )}
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatMatchDate(fixture.match_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatMatchTime(fixture.time || '18:00')}</span>
                        </div>
                        {fixture.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-20">{fixture.venue}</span>
                          </div>
                        )}
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
