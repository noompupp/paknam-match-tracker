
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Target, Users } from "lucide-react";
import { debugPlayerDropdownData, ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface GoalAssignmentFormProps {
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
}

const GoalAssignmentForm = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedPlayer,
  selectedGoalType,
  onPlayerSelect,
  onGoalTypeChange
}: GoalAssignmentFormProps) => {
  // Use filtered players if provided, otherwise use all players
  const playersToShow = homeTeamPlayers && awayTeamPlayers 
    ? [...homeTeamPlayers, ...awayTeamPlayers]
    : allPlayers;

  console.log('⚽ GoalAssignmentForm Debug:');
  console.log('  - Players available (filtered):', playersToShow.length);
  console.log('  - Home team players:', homeTeamPlayers?.length || 0);
  console.log('  - Away team players:', awayTeamPlayers?.length || 0);
  console.log('  - Selected player:', selectedPlayer);
  
  // Debug player data for this specific dropdown
  debugPlayerDropdownData(playersToShow, "Goal Assignment Form - Filtered");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="playerSelect">Select Player</Label>
        <Select value={selectedPlayer} onValueChange={onPlayerSelect}>
          <SelectTrigger className="bg-white border-input relative z-50">
            <SelectValue placeholder={playersToShow.length > 0 ? "Choose a player" : "No players available"} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-border shadow-lg max-h-60 z-[100]">
            {playersToShow.length === 0 ? (
              <SelectItem value="no-players" disabled className="text-muted-foreground">
                No players available - check fixture selection
              </SelectItem>
            ) : (
              <>
                {homeTeamPlayers && homeTeamPlayers.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-b">
                      Home Team
                    </div>
                    {homeTeamPlayers.map((player) => (
                      <SelectItem 
                        key={`home-player-${player.id}`}
                        value={player.id.toString()}
                        className="hover:bg-accent focus:bg-accent cursor-pointer py-3"
                      >
                        <div className="flex items-center gap-2 py-1 w-full">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                            {player.number || '?'}
                          </div>
                          <span className="font-medium">{player.name}</span>
                          <span className="text-xs text-muted-foreground">({player.team})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {awayTeamPlayers && awayTeamPlayers.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-b border-t">
                      Away Team
                    </div>
                    {awayTeamPlayers.map((player) => (
                      <SelectItem 
                        key={`away-player-${player.id}`}
                        value={player.id.toString()}
                        className="hover:bg-accent focus:bg-accent cursor-pointer py-3"
                      >
                        <div className="flex items-center gap-2 py-1 w-full">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">
                            {player.number || '?'}
                          </div>
                          <span className="font-medium">{player.name}</span>
                          <span className="text-xs text-muted-foreground">({player.team})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {(!homeTeamPlayers || !awayTeamPlayers) && playersToShow.map((player) => (
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
                ))}
              </>
            )}
          </SelectContent>
        </Select>
        {playersToShow.length === 0 && (
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
