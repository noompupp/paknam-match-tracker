
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface GoalsAndAssistsSectionProps {
  selectedFixtureData: any;
  goals: any[];
  allPlayers: any[];
  formatTime: (seconds: number) => string;
}

const GoalsAndAssistsSection = ({
  selectedFixtureData,
  goals,
  allPlayers,
  formatTime
}: GoalsAndAssistsSectionProps) => {
  const getPlayerRole = (playerId: number) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player?.position || 'Player';
  };

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
        <p className="text-sm text-muted-foreground text-center py-2">No goals or assists recorded</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Goals */}
          <div>
            <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.home_team?.name}</h5>
            <div className="space-y-1">
              {homeGoals.map((goal, index) => (
                <div key={index} className="text-sm flex items-center justify-between p-2 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={goal.type === 'goal' ? 'default' : 'outline'} className="text-xs">
                      {goal.type}
                    </Badge>
                    <span className="font-medium">{goal.playerName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getPlayerRole(parseInt(goal.playerId))}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                </div>
              ))}
              {homeGoals.length === 0 && (
                <p className="text-xs text-muted-foreground">No goals or assists</p>
              )}
            </div>
          </div>

          {/* Away Goals */}
          <div>
            <h5 className="font-medium text-sm mb-2">{selectedFixtureData?.away_team?.name}</h5>
            <div className="space-y-1">
              {awayGoals.map((goal, index) => (
                <div key={index} className="text-sm flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={goal.type === 'goal' ? 'default' : 'outline'} className="text-xs">
                      {goal.type}
                    </Badge>
                    <span className="font-medium">{goal.playerName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getPlayerRole(parseInt(goal.playerId))}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                </div>
              ))}
              {awayGoals.length === 0 && (
                <p className="text-xs text-muted-foreground">No goals or assists</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsAndAssistsSection;
