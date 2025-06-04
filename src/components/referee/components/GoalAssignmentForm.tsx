
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Target, Users } from "lucide-react";
import { debugPlayerDropdownData } from "@/utils/refereeDataProcessor";

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
  console.log('⚽ GoalAssignmentForm Debug:');
  console.log('  - Players available:', allPlayers.length);
  console.log('  - Selected player:', selectedPlayer);
  
  // Debug player data for this specific dropdown
  debugPlayerDropdownData(allPlayers, "Goal Assignment Form");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="playerSelect">Select Player</Label>
        <Select value={selectedPlayer} onValueChange={onPlayerSelect}>
          <SelectTrigger className="bg-white border-input relative z-50">
            <SelectValue placeholder={allPlayers.length > 0 ? "Choose a player" : "No players available"} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-border shadow-lg max-h-60 z-[100]">
            {allPlayers.length === 0 ? (
              <SelectItem value="no-players" disabled className="text-muted-foreground">
                No players available - check fixture selection
              </SelectItem>
            ) : (
              allPlayers.map((player) => (
                <SelectItem 
                  key={`player-${player.id}`}
                  value={player.id.toString()}
                  className="hover:bg-accent focus:bg-accent cursor-pointer py-3"
                >
                  <div className="flex items-center gap-2 py-1 w-full">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {player.number || '?'}
                    </div>
                    <span className="font-medium">{player.name}</span>
                    <span className="text-xs text-muted-foreground">({player.team})</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {allPlayers.length === 0 && (
          <p className="text-xs text-red-500 mt-1">
            ⚠️ No players found. Please ensure a fixture is selected and teams have players.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goalTypeSelect">Type</Label>
        <Select value={selectedGoalType} onValueChange={onGoalTypeChange}>
          <SelectTrigger className="bg-white border-input relative z-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-border shadow-lg z-[100]">
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
