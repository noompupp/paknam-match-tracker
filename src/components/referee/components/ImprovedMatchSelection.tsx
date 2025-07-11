
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t, language } = useTranslation();

  // Format date to Thai or English as appropriate
  const formatMatchDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Use th-TH or en-US depending on language
      return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatMatchTime = (timeStr: string) => {
    try {
      const timeParts = timeStr.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeStr;
    }
  };

  const getMatchStatus = (fixture: any) => {
    if (fixture.status === 'completed') return { label: t('referee.completed'), variant: 'secondary' as const };
    if (fixture.status === 'in_progress') return { label: t('referee.live'), variant: 'destructive' as const };
    if (fixture.home_score !== null || fixture.away_score !== null) {
      return { label: t('referee.scored'), variant: 'default' as const };
    }
    return { label: t('referee.scheduled'), variant: 'outline' as const };
  };

  // Sort fixtures by ID (ascending order) for consistent ordering
  const sortedFixtures = fixtures?.slice().sort((a, b) => {
    return a.id - b.id;
  }) || [];

  return (
    <Card className="referee-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{t('referee.matchSelectionTitle')}</CardTitle>
          {selectedFixture && (
            <Badge variant={enhancedPlayersData.hasValidData ? 'default' : 'destructive'}>
              {enhancedPlayersData.hasValidData ? t('referee.dataReady') : t('referee.dataIssues')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Select value={selectedFixture} onValueChange={onFixtureChange}>
          <SelectTrigger className="w-full referee-select referee-focus h-auto min-h-[44px]">
            <SelectValue placeholder={t('referee.chooseMatchPlaceholder')} />
          </SelectTrigger>
          <SelectContent className="max-h-80 overflow-y-auto bg-background border border-border shadow-lg z-50">
            {sortedFixtures.map((fixture) => {
              const status = getMatchStatus(fixture);
              const homeTeam = fixture.home_team?.name || fixture.team1 || t('referee.homeTeam');
              const awayTeam = fixture.away_team?.name || fixture.team2 || t('referee.awayTeam');
              const score = (fixture.home_score !== null && fixture.away_score !== null) 
                ? `${fixture.home_score}-${fixture.away_score}` 
                : null;

              const kickoffTime = fixture.match_time || fixture.time || '18:00';

              // VS string must use translation
              const teamsVs = t('referee.matchTeamsVs')
                .replace('{home}', homeTeam)
                .replace('{away}', awayTeam);

              return (
                <SelectItem 
                  key={fixture.id} 
                  value={fixture.id.toString()}
                  className="p-4 cursor-pointer referee-interactive border-b border-border/50 last:border-b-0 focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="w-full space-y-3">
                    {/* Match teams and score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-foreground">
                          {teamsVs}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {score && (
                          <Badge variant="outline" className="text-xs font-bold">
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
                        <Clock className="h-3 w-3" />
                        <span>{formatMatchTime(kickoffTime)}</span>
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
          <div className="referee-status-warning rounded-lg p-3 border">
            <div className="text-sm font-medium mb-1">
              {t('referee.dataIssues')}
            </div>
            <ul className="text-xs space-y-1">
              {enhancedPlayersData.dataIssues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovedMatchSelection;
