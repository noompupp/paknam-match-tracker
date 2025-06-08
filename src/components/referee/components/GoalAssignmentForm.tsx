
import { Label } from "@/components/ui/label";
import { Target, Users } from "lucide-react";
import { debugPlayerDropdownData, ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";

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
        <EnhancedRefereeSelect 
          value={selectedPlayer} 
          onValueChange={onPlayerSelect}
          placeholder={playersToShow.length > 0 ? "Choose a player" : "No players available"}
          disabled={playersToShow.length === 0}
        >
          <EnhancedRefereeSelectContent>
            {playersToShow.length === 0 ? (
              <EnhancedRefereeSelectItem value="no-players" disabled>
                No players available - check fixture selection
              </EnhancedRefereeSelectItem>
            ) : (
              <>
                {homeTeamPlayers && homeTeamPlayers.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-b">
                      Home Team
                    </div>
                    {homeTeamPlayers.map((player) => (
                      <EnhancedRefereeSelectItem 
                        key={`home-player-${player.id}`}
                        value={player.id.toString()}
                        playerData={{
                          name: player.name,
                          team: player.team,
                          number: player.number || '?',
                          position: player.position
                        }}
                      >
                        {player.name}
                      </EnhancedRefereeSelectItem>
                    ))}
                  </>
                )}
                
                {awayTeamPlayers && awayTeamPlayers.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-b border-t">
                      Away Team
                    </div>
                    {awayTeamPlayers.map((player) => (
                      <EnhancedRefereeSelectItem 
                        key={`away-player-${player.id}`}
                        value={player.id.toString()}
                        playerData={{
                          name: player.name,
                          team: player.team,
                          number: player.number || '?',
                          position: player.position
                        }}
                      >
                        {player.name}
                      </EnhancedRefereeSelectItem>
                    ))}
                  </>
                )}
                
                {(!homeTeamPlayers || !awayTeamPlayers) && playersToShow.map((player) => (
                  <EnhancedRefereeSelectItem 
                    key={`player-${player.id}`}
                    value={player.id.toString()}
                    playerData={{
                      name: player.name,
                      team: player.team,
                      number: player.number || '?',
                      position: player.position
                    }}
                  >
                    {player.name}
                  </EnhancedRefereeSelectItem>
                ))}
              </>
            )}
          </EnhancedRefereeSelectContent>
        </EnhancedRefereeSelect>
        {playersToShow.length === 0 && (
          <p className="text-xs text-red-500 mt-1">
            ⚠️ No players found. Please ensure a fixture is selected and teams have players.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goalTypeSelect">Type</Label>
        <EnhancedRefereeSelect 
          value={selectedGoalType} 
          onValueChange={onGoalTypeChange}
          placeholder="Select type"
        >
          <EnhancedRefereeSelectContent>
            <EnhancedRefereeSelectItem value="goal">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Goal (Auto-updates score)
              </div>
            </EnhancedRefereeSelectItem>
            <EnhancedRefereeSelectItem value="assist">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Assist
              </div>
            </EnhancedRefereeSelectItem>
          </EnhancedRefereeSelectContent>
        </EnhancedRefereeSelect>
      </div>
    </div>
  );
};

export default GoalAssignmentForm;
