
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { Users, Play, HomeIcon, Users2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PlayerRoleBadge from "@/components/ui/player-role-badge";

interface InitialPlayerSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeamPlayers: ProcessedPlayer[];
  awayTeamPlayers: ProcessedPlayer[];
  onStartMatch: (selectedPlayers: ProcessedPlayer[], team: 'home' | 'away') => void;
  selectedFixtureData: any;
}

const InitialPlayerSelection = ({
  isOpen,
  onClose,
  homeTeamPlayers,
  awayTeamPlayers,
  onStartMatch,
  selectedFixtureData
}: InitialPlayerSelectionProps) => {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set());

  const REQUIRED_PLAYERS = 7;

  const getAvailablePlayers = () => {
    if (selectedTeam === 'home') return homeTeamPlayers;
    if (selectedTeam === 'away') return awayTeamPlayers;
    return [];
  };

  const availablePlayers = getAvailablePlayers();
  const selectedCount = selectedPlayerIds.size;
  const isValidSelection = selectedCount === REQUIRED_PLAYERS;

  const handlePlayerToggle = (playerId: number, checked: boolean) => {
    const newSelected = new Set(selectedPlayerIds);
    
    if (checked && selectedCount < REQUIRED_PLAYERS) {
      newSelected.add(playerId);
    } else if (!checked) {
      newSelected.delete(playerId);
    }
    
    setSelectedPlayerIds(newSelected);
  };

  const handleStartMatch = () => {
    if (!selectedTeam || !isValidSelection) return;
    
    const selectedPlayers = availablePlayers.filter(player => 
      selectedPlayerIds.has(player.id)
    );
    
    onStartMatch(selectedPlayers, selectedTeam);
    
    // Reset state
    setSelectedTeam(null);
    setSelectedPlayerIds(new Set());
    onClose();
  };

  const handleCancel = () => {
    setSelectedTeam(null);
    setSelectedPlayerIds(new Set());
    onClose();
  };

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0 sm:p-6 sm:h-auto sm:max-h-[80vh]">
        <DialogHeader className="p-4 sm:p-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Select Starting Squad ({REQUIRED_PLAYERS} players)
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col px-4 sm:px-0">
          {!selectedTeam ? (
            // Team Selection Step
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Choose which team you want to track playing time for during this match.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTeam('home')}
                  className="h-20 flex flex-col items-center gap-2"
                  disabled={homeTeamPlayers.length === 0}
                >
                  <HomeIcon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">{getTeamName('home')}</div>
                    <div className="text-sm text-muted-foreground">
                      {homeTeamPlayers.length} players available
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedTeam('away')}
                  className="h-20 flex flex-col items-center gap-2"
                  disabled={awayTeamPlayers.length === 0}
                >
                  <Users2 className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">{getTeamName('away')}</div>
                    <div className="text-sm text-muted-foreground">
                      {awayTeamPlayers.length} players available
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            // Player Selection Step
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Header Section - Fixed */}
              <div className="flex-shrink-0 space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {getTeamName(selectedTeam)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isValidSelection ? "default" : "secondary"}
                      className="text-sm"
                    >
                      {selectedCount}/{REQUIRED_PLAYERS} selected
                    </Badge>
                  </div>
                </div>

                {selectedCount === REQUIRED_PLAYERS && (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      Perfect! You have selected exactly {REQUIRED_PLAYERS} players for the starting squad.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Players List - Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                {availablePlayers.map((player) => {
                  const isSelected = selectedPlayerIds.has(player.id);
                  const canSelect = selectedCount < REQUIRED_PLAYERS || isSelected;
                  
                  return (
                    <div 
                      key={player.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : canSelect 
                            ? 'border-border hover:border-primary/50' 
                            : 'border-border opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handlePlayerToggle(player.id, checked as boolean)
                          }
                          disabled={!canSelect}
                        />
                        
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                          {player.number || '?'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{player.name}</span>
                            <PlayerRoleBadge role={player.role || 'Starter'} size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 pt-3 border-t bg-background">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTeam(null)}
                    className="flex-1"
                  >
                    Back to Team Selection
                  </Button>
                  <Button
                    onClick={handleStartMatch}
                    disabled={!isValidSelection}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Match Tracking
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Safe Area Bottom Padding */}
        <div className="h-4 sm:h-0 flex-shrink-0"></div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialPlayerSelection;
