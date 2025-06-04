
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Target, User, Trophy, Users } from "lucide-react";

interface Player {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
}

interface GoalData {
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  type: 'goal' | 'assist';
}

interface GoalAssignmentProps {
  allPlayers: Player[];
  goals: GoalData[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onAssignGoal: () => void;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
}

const GoalAssignment = ({
  allPlayers,
  goals,
  selectedPlayer,
  selectedGoalType,
  matchTime,
  onPlayerSelect,
  onGoalTypeChange,
  onAssignGoal,
  formatTime,
  homeScore,
  awayScore,
  selectedFixtureData
}: GoalAssignmentProps) => {
  const homeTeamGoals = goals.filter(goal => 
    goal.type === 'goal' && goal.team === selectedFixtureData?.home_team?.name
  ).length;
  
  const awayTeamGoals = goals.filter(goal => 
    goal.type === 'goal' && goal.team === selectedFixtureData?.away_team?.name
  ).length;

  const totalAssists = goals.filter(goal => goal.type === 'assist').length;

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal & Assist Assignment
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Assign goals and assists to players - scores update automatically when goals are assigned
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Score Display */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-sm font-medium text-gray-600">
                {selectedFixtureData?.home_team?.name || 'Home'}
              </div>
              <div className="text-2xl font-bold text-blue-600">{homeScore}</div>
              <div className="text-xs text-gray-500">
                Goals from assignments: {homeTeamGoals}
              </div>
            </div>
            <div className="text-center px-4">
              <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
              <div className="text-xs text-gray-500">VS</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-sm font-medium text-gray-600">
                {selectedFixtureData?.away_team?.name || 'Away'}
              </div>
              <div className="text-2xl font-bold text-green-600">{awayScore}</div>
              <div className="text-xs text-gray-500">
                Goals from assignments: {awayTeamGoals}
              </div>
            </div>
          </div>
          <div className="text-center mt-2 text-xs text-gray-600">
            <Users className="h-4 w-4 inline mr-1" />
            Total Assists: {totalAssists}
          </div>
        </div>

        {/* Assignment Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="playerSelect">Select Player</Label>
            <Select value={selectedPlayer} onValueChange={onPlayerSelect}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Choose a player" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg max-h-60 z-50">
                {allPlayers.map((player) => (
                  <SelectItem 
                    key={player.id} 
                    value={player.id.toString()}
                    className="hover:bg-accent focus:bg-accent cursor-pointer"
                  >
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                        {player.number}
                      </div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-xs text-muted-foreground">({player.team})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalTypeSelect">Type</Label>
            <Select value={selectedGoalType} onValueChange={onGoalTypeChange}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                <SelectItem value="goal" className="hover:bg-accent focus:bg-accent cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    Goal (Auto-updates score)
                  </div>
                </SelectItem>
                <SelectItem value="assist" className="hover:bg-accent focus:bg-accent cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Assist
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={onAssignGoal} 
          className="w-full"
          disabled={!selectedPlayer}
        >
          <Target className="h-4 w-4 mr-2" />
          Assign {selectedGoalType === 'goal' ? 'Goal' : 'Assist'} at {formatTime(matchTime)}
          {selectedGoalType === 'goal' && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
              Score will update automatically
            </span>
          )}
        </Button>

        {/* Assigned Goals/Assists List */}
        {goals.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Match Events ({goals.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={goal.type === 'goal' ? 'default' : 'outline'}
                      className={goal.type === 'goal' ? 'bg-green-600' : 'border-blue-500 text-blue-600'}
                    >
                      {goal.type === 'goal' ? (
                        <><Target className="h-3 w-3 mr-1" />Goal</>
                      ) : (
                        <><Users className="h-3 w-3 mr-1" />Assist</>
                      )}
                    </Badge>
                    <div>
                      <span className="font-medium text-sm">{goal.playerName}</span>
                      <div className="text-xs text-muted-foreground">{goal.team}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">{formatTime(goal.time)}</span>
                    {goal.type === 'goal' && (
                      <span className="text-xs text-green-600 font-medium">Score Updated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {goals.length === 0 && (
          <div className="text-center text-muted-foreground py-6 border-2 border-dashed border-gray-200 rounded-lg">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No goals or assists assigned yet</p>
            <p className="text-xs mt-1">Assign your first goal to see automatic score updates</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalAssignment;
