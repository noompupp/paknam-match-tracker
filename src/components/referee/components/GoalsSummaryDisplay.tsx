
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { enhancedMatchSummaryService } from '@/services/fixtures/enhancedMatchSummaryService';

interface GoalsSummaryDisplayProps {
  selectedFixtureData: any;
  goals: any[];
  formatTime: (seconds: number) => string;
  fixtureId?: number;
}

const GoalsSummaryDisplay = ({
  selectedFixtureData,
  goals,
  formatTime,
  fixtureId
}: GoalsSummaryDisplayProps) => {
  // Fetch enhanced database data if fixture ID is available
  const { data: enhancedData } = useQuery({
    queryKey: ['enhancedGoalsSummary', fixtureId],
    queryFn: () => enhancedMatchSummaryService.getEnhancedMatchSummary(fixtureId!),
    enabled: !!fixtureId,
    staleTime: 30 * 1000
  });
  
  // Use enhanced database data if available, fallback to local goals
  const goalsToDisplay = enhancedData?.goals.length ? enhancedData.goals : goals;
  
  if (!selectedFixtureData || goalsToDisplay.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals & Assists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No goals or assists recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  const homeTeamId = selectedFixtureData?.home_team_id || selectedFixtureData?.home_team?.id;
  const awayTeamId = selectedFixtureData?.away_team_id || selectedFixtureData?.away_team?.id;
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';

  const homeTeamGoals = goalsToDisplay.filter(goal => 
    goal.team === homeTeamName || 
    goal.team === homeTeamId ||
    goal.teamId === homeTeamId
  );
  
  const awayTeamGoals = goalsToDisplay.filter(goal => 
    goal.team === awayTeamName ||
    goal.team === awayTeamId ||
    goal.teamId === awayTeamId
  );

  const renderGoalsList = (teamGoals: any[], teamName: string) => {
    if (teamGoals.length === 0) {
      return <p className="text-sm text-muted-foreground italic">No {teamName.toLowerCase()} goals or assists</p>;
    }

    return (
      <div className="space-y-3">
        {teamGoals.map((goal, index) => {
          const uniqueKey = goal.id || `${goal.playerId || 'unknown'}-${goal.time}-${goal.type}-${index}`;
          const displayName = goal.playerName || goal.player_name || 'Unknown Player';
          const eventTime = goal.time || 0;
          const eventType = goal.type || 'goal';
          
          return (
            <div key={uniqueKey} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Badge variant={eventType === 'goal' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {eventType === 'goal' ? '⚽' : '🅰️'}
                  <span className="capitalize">{eventType}</span>
                </Badge>
                <div>
                  <div className="font-medium">{displayName}</div>
                  {goal.timestamp && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(goal.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {formatTime(eventTime)}
                </Badge>
                {enhancedData && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    DB
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalGoals = goalsToDisplay.filter(g => g.type === 'goal').length;
  const totalAssists = goalsToDisplay.filter(g => g.type === 'assist').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals & Assists
          <div className="flex gap-2 ml-auto">
            <Badge variant="outline">{totalGoals} goals</Badge>
            <Badge variant="outline">{totalAssists} assists</Badge>
            {enhancedData?.goals.length && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Enhanced Data
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {homeTeamName}
              <Badge variant="secondary">{homeTeamGoals.length}</Badge>
            </h4>
            {renderGoalsList(homeTeamGoals, homeTeamName)}
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {awayTeamName}
              <Badge variant="secondary">{awayTeamGoals.length}</Badge>
            </h4>
            {renderGoalsList(awayTeamGoals, awayTeamName)}
          </div>
        </div>

        {/* Enhanced Statistics Summary */}
        {enhancedData?.summary && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-lg text-blue-600">{enhancedData.summary.homeTeamGoals}</div>
                <div className="text-muted-foreground">Home Goals</div>
              </div>
              <div>
                <div className="font-bold text-lg text-red-600">{enhancedData.summary.awayTeamGoals}</div>
                <div className="text-muted-foreground">Away Goals</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsSummaryDisplay;
