
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Target, Users, Users2, HomeIcon } from "lucide-react";
import { debugPlayerDropdownData, ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";

interface GoalAssignmentFormProps {
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onGoalTeamChange: (value: string) => void;
  selectedFixtureData?: any;
}

const GoalAssignmentForm = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  selectedPlayer,
  selectedGoalType,
  selectedGoalTeam,
  onPlayerSelect,
  onGoalTypeChange,
  onGoalTeamChange,
  selectedFixtureData
}: GoalAssignmentFormProps) => {
  // Get filtered players based on selected team
  const getFilteredPlayers = () => {
    if (!selectedGoalTeam) return [];
    
    if (selectedGoalTeam === 'home' && homeTeamPlayers) {
      return homeTeamPlayers;
    } else if (selectedGoalTeam === 'away' && awayTeamPlayers) {
      return awayTeamPlayers;
    }
    
    return [];
  };

  const filteredPlayers = getFilteredPlayers();

  console.log('⚽ GoalAssignmentForm Debug:');
  console.log('  - Selected team:', selectedGoalTeam);
  console.log('  - Filtered players count:', filteredPlayers.length);
  console.log('  - Home team players:', homeTeamPlayers?.length || 0);
  console.log('  - Away team players:', awayTeamPlayers?.length || 0);
  console.log('  - Selected player:', selectedPlayer);
  
  // Debug player data for this specific dropdown
  debugPlayerDropdownData(filteredPlayers, "Goal Assignment Form - Team Filtered");
  
  // Clear player selection when team changes
  const handleTeamChange = (team: string) => {
    onGoalTeamChange(team);
    onPlayerSelect(""); // Clear player selection when team changes
  };

  return (
    <div className="space-y-4">
      {/* Team Selection */}
      <div className="space-y-2">
        <Label>Select Team</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={selectedGoalTeam === 'home' ? 'default' : 'outline'}
            onClick={() => handleTeamChange('home')}
            className="flex items-center gap-2 min-h-[44px]"
            disabled={!selectedFixtureData}
          >
            <HomeIcon className="h-4 w-4" />
            {selectedFixtureData?.home_team?.name || 'Home Team'}
          </Button>
          <Button
            type="button"
            variant={selectedGoalTeam === 'away' ? 'default' : 'outline'}
            onClick={() => handleTeamChange('away')}
            className="flex items-center gap-2 min-h-[44px]"
            disabled={!selectedFixtureData}
          >
            <Users2 className="h-4 w-4" />
            {selectedFixtureData?.away_team?.name || 'Away Team'}
          </Button>
        </div>
        {!selectedFixtureData && (
          <p className="text-xs text-red-500">
            ⚠️ Please select a fixture first
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Selection */}
        <div className="space-y-2">
          <Label htmlFor="playerSelect">Select Player</Label>
          <EnhancedRefereeSelect 
            value={selectedPlayer} 
            onValueChange={onPlayerSelect}
            placeholder={
              !selectedGoalTeam ? "Select a team first" :
              filteredPlayers.length > 0 ? "Choose a player" : "No players available"
            }
            disabled={!selectedGoalTeam || filteredPlayers.length === 0}
          >
            <EnhancedRefereeSelectContent>
              {!selectedGoalTeam ? (
                <EnhancedRefereeSelectItem value="no-team" disabled>
                  Please select a team first
                </EnhancedRefereeSelectItem>
              ) : filteredPlayers.length === 0 ? (
                <EnhancedRefereeSelectItem value="no-players" disabled>
                  No players available for selected team
                </EnhancedRefereeSelectItem>
              ) : (
                filteredPlayers.map((player) => (
                  <EnhancedRefereeSelectItem 
                    key={`goal-player-${player.id}`}
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
                ))
              )}
            </EnhancedRefereeSelectContent>
          </EnhancedRefereeSelect>
          {selectedGoalTeam && filteredPlayers.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ No players found for {selectedGoalTeam} team
            </p>
          )}
        </div>

        {/* Goal Type Selection */}
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
    </div>
  );
};

export default GoalAssignmentForm;
