
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEnhancedMatchSummary } from "@/hooks/useEnhancedMatchSummary";

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
  // Fetch database data if fixture ID is available
  const { data: enhancedData } = useEnhancedMatchSummary(fixtureId);
  
  // Use database data if available, fallback to local goals
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

  const homeTeamGoals = goalsToDisplay.filter(goal => 
    goal.team === selectedFixtureData?.home_team?.name || 
    goal.team === selectedFixtureData?.home_team_id
  );
  
  const awayTeamGoals = goalsToDisplay.filter(goal => 
    goal.team === selectedFixtureData?.away_team?.name ||
    goal.team === selectedFixtureData?.away_team_id
  );

  const renderGoalsList = (teamGoals: any[], teamName: string) => {
    if (teamGoals.length === 0) {
      return <p className="text-sm text-muted-foreground">No {teamName.toLowerCase()} goals</p>;
    }

    return (
      <div className="space-y-2">
        {teamGoals.map((goal, index) => (
          <div key={`${goal.playerId || goal.id}-${goal.time}-${index}`} className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="flex items-center gap-2">
              <Badge variant={goal.type === 'goal' ? 'default' : 'secondary'}>
                {goal.type === 'goal' ? '⚽' : '🅰️'}
              </Badge>
              <span className="font-medium">{goal.playerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatTime(goal.time)}</span>
              <Badge variant="outline" className="text-xs">
                {goal.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals & Assists
          <Badge variant="outline">{goalsToDisplay.length} total events</Badge>
          {enhancedData?.goals.length && (
            <Badge variant="default" className="bg-green-100 text-green-800">Database</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {selectedFixtureData?.home_team?.name || 'Home Team'}
              <Badge variant="secondary">{homeTeamGoals.length}</Badge>
            </h4>
            {renderGoalsList(homeTeamGoals, selectedFixtureData?.home_team?.name || 'Home')}
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {selectedFixtureData?.away_team?.name || 'Away Team'}
              <Badge variant="secondary">{awayTeamGoals.length}</Badge>
            </h4>
            {renderGoalsList(awayTeamGoals, selectedFixtureData?.away_team?.name || 'Away')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsSummaryDisplay;
