
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Target, User } from "lucide-react";

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
  formatTime
}: GoalAssignmentProps) => {
  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  Goal
                </SelectItem>
                <SelectItem value="assist" className="hover:bg-accent focus:bg-accent cursor-pointer">
                  Assist
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
        </Button>

        {/* Assigned Goals/Assists List */}
        {goals.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Assigned Goals & Assists
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant={goal.type === 'goal' ? 'default' : 'outline'}>
                      {goal.type === 'goal' ? 'Goal' : 'Assist'}
                    </Badge>
                    <span className="font-medium text-sm">{goal.playerName}</span>
                    <span className="text-xs text-muted-foreground">({goal.team})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(goal.time)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalAssignment;
