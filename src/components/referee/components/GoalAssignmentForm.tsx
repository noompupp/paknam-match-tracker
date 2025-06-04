
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Target, Users } from "lucide-react";

interface Player {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
}

interface GoalAssignmentFormProps {
  allPlayers: Player[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
}

const GoalAssignmentForm = ({
  allPlayers,
  selectedPlayer,
  selectedGoalType,
  onPlayerSelect,
  onGoalTypeChange
}: GoalAssignmentFormProps) => {
  return (
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
  );
};

export default GoalAssignmentForm;
