
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface GoalsSummaryDisplayProps {
  selectedFixtureData: any;
  goals: any[];
  formatTime: (seconds: number) => string;
}

const GoalsSummaryDisplay = ({
  selectedFixtureData,
  goals,
  formatTime
}: GoalsSummaryDisplayProps) => {
  // Enhanced deduplication with more comprehensive unique key generation
  const createUniqueKey = (item: any, type: string) => {
    return `${type}-${item.playerId || item.player_id}-${item.time}-${item.type || item.card_type}-${item.team}`;
  };

  // Deduplicate goals with enhanced logic
  const uniqueGoals = goals.filter((goal, index, self) => {
    const currentKey = createUniqueKey(goal, 'goal');
    return index === self.findIndex(g => createUniqueKey(g, 'goal') === currentKey);
  });

  console.log('🔍 Enhanced deduplication results:', {
    originalGoals: goals.length,
    uniqueGoals: uniqueGoals.length
  });

  const homeTeam = selectedFixtureData.home_team?.name || 'Home Team';
  const awayTeam = selectedFixtureData.away_team?.name || 'Away Team';

  const homeGoals = uniqueGoals.filter(goal => goal.team === homeTeam && goal.type === 'goal');
  const awayGoals = uniqueGoals.filter(goal => goal.team === awayTeam && goal.type === 'goal');
  const assists = uniqueGoals.filter(goal => goal.type === 'assist');

  if (uniqueGoals.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals & Assists ({uniqueGoals.length})
          <Badge variant="outline" className="ml-auto text-xs">
            Deduplicated
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Team Goals */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">{homeTeam}</h4>
            <div className="space-y-2">
              {homeGoals.map((goal, index) => (
                <div key={`home-goal-${index}-${goal.playerId}-${goal.time}`} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="font-medium">{goal.playerName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Goal
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatTime(goal.time)}</span>
                  </div>
                </div>
              ))}
              {assists.filter(assist => assist.team === homeTeam).map((assist, index) => (
                <div key={`home-assist-${index}-${assist.playerId}-${assist.time}`} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="font-medium">{assist.playerName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Assist
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatTime(assist.time)}</span>
                  </div>
                </div>
              ))}
              {homeGoals.length === 0 && assists.filter(assist => assist.team === homeTeam).length === 0 && (
                <p className="text-sm text-muted-foreground italic">No goals or assists</p>
              )}
            </div>
          </div>

          {/* Away Team Goals */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">{awayTeam}</h4>
            <div className="space-y-2">
              {awayGoals.map((goal, index) => (
                <div key={`away-goal-${index}-${goal.playerId}-${goal.time}`} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="font-medium">{goal.playerName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Goal
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatTime(goal.time)}</span>
                  </div>
                </div>
              ))}
              {assists.filter(assist => assist.team === awayTeam).map((assist, index) => (
                <div key={`away-assist-${index}-${assist.playerId}-${assist.time}`} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="font-medium">{assist.playerName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Assist
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatTime(assist.time)}</span>
                  </div>
                </div>
              ))}
              {awayGoals.length === 0 && assists.filter(assist => assist.team === awayTeam).length === 0 && (
                <p className="text-sm text-muted-foreground italic">No goals or assists</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsSummaryDisplay;
