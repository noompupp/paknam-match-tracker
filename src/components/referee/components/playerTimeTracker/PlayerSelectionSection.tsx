
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HomeIcon, Users2, UserPlus } from "lucide-react";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface PlayerSelectionSectionProps {
  selectedPlayer: string;
  selectedTimeTeam: string;
  selectedFixtureData: any;
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  onPlayerSelect: (value: string) => void;
  onTimeTeamChange: (value: string) => void;
  onAddPlayer: () => void;
}

const PlayerSelectionSection = ({
  selectedPlayer,
  selectedTimeTeam,
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  onPlayerSelect,
  onTimeTeamChange,
  onAddPlayer
}: PlayerSelectionSectionProps) => {
  // Get filtered players based on selected team
  const getFilteredPlayers = () => {
    if (!selectedTimeTeam) return [];
    
    if (selectedTimeTeam === 'home' && homeTeamPlayers) {
      return homeTeamPlayers;
    } else if (selectedTimeTeam === 'away' && awayTeamPlayers) {
      return awayTeamPlayers;
    }
    
    return [];
  };

  const filteredPlayers = getFilteredPlayers();

  // Clear player selection when team changes
  const handleTeamChange = (team: string) => {
    onTimeTeamChange(team);
    onPlayerSelect(""); // Clear player selection when team changes
  };

  return (
    <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
      <h4 className="font-semibold text-sm">Add Player to Track</h4>
      
      {/* Team Selection */}
      <div className="space-y-2">
        <Label>Select Team</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={selectedTimeTeam === 'home' ? 'default' : 'outline'}
            onClick={() => handleTeamChange('home')}
            className="flex items-center gap-2 min-h-[44px]"
            disabled={!selectedFixtureData}
          >
            <HomeIcon className="h-4 w-4" />
            {selectedFixtureData?.home_team?.name || 'Home Team'}
          </Button>
          <Button
            type="button"
            variant={selectedTimeTeam === 'away' ? 'default' : 'outline'}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="playerSelect">Select Player</Label>
          <EnhancedRefereeSelect 
            value={selectedPlayer} 
            onValueChange={onPlayerSelect}
            placeholder={
              !selectedTimeTeam ? "Select a team first" :
              filteredPlayers.length > 0 ? "Choose a player" : "No players available"
            }
            disabled={!selectedTimeTeam || filteredPlayers.length === 0}
          >
            <EnhancedRefereeSelectContent>
              {!selectedTimeTeam ? (
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
                    key={`time-player-${player.id}`}
                    value={player.id.toString()}
                    playerData={{
                      name: player.name,
                      team: player.team,
                      number: player.number || '?',
                      position: player.role // Use role instead of position for display
                    }}
                  >
                    {player.name}
                  </EnhancedRefereeSelectItem>
                ))
              )}
            </EnhancedRefereeSelectContent>
          </EnhancedRefereeSelect>
          {selectedTimeTeam && filteredPlayers.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ No players found for {selectedTimeTeam} team
            </p>
          )}
        </div>
        <div className="flex items-end">
          <Button
            onClick={onAddPlayer}
            disabled={!selectedPlayer || !selectedTimeTeam || filteredPlayers.length === 0}
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionSection;
