
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface GoalsSummarySectionProps {
  goals: any[];
  selectedFixtureData: any;
  allPlayers: any[];
  formatTime: (seconds: number) => string;
}

const GoalsSummarySection = ({
  goals,
  selectedFixtureData,
  allPlayers,
  formatTime
}: GoalsSummarySectionProps) => {
  const homeGoals = goals.filter(g => 
    selectedFixtureData && 
    allPlayers.find(p => p.id.toString() === g.playerId)?.team === selectedFixtureData.home_team?.name
  );
  
  const awayGoals = goals.filter(g => 
    selectedFixtureData && 
    allPlayers.find(p => p.id.toString() === g.playerId)?.team === selectedFixtureData.away_team?.name
  );

  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <Target className="h-4 w-4" />
        Goals & Assists ({goals.length})
      </h4>
      
      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No goals scored</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Goals */}
          <div>
            <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.home_team?.name}</h5>
            <div className="space-y-1">
              {homeGoals.map((goal, index) => (
                <div key={index} className="text-sm flex items-center justify-between p-2 bg-green-50 rounded">
                  <div>
                    <Badge variant={goal.type === 'goal' ? 'default' : 'outline'} className="mr-2">
                      {goal.type}
                    </Badge>
                    <span>{goal.playerName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                </div>
              ))}
              {homeGoals.length === 0 && (
                <p className="text-xs text-muted-foreground">No goals</p>
              )}
            </div>
          </div>

          {/* Away Goals */}
          <div>
            <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.away_team?.name}</h5>
            <div className="space-y-1">
              {awayGoals.map((goal, index) => (
                <div key={index} className="text-sm flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div>
                    <Badge variant={goal.type === 'goal' ? 'default' : 'outline'} className="mr-2">
                      {goal.type}
                    </Badge>
                    <span>{goal.playerName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                </div>
              ))}
              {awayGoals.length === 0 && (
                <p className="text-xs text-muted-foreground">No goals</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSummarySection;
