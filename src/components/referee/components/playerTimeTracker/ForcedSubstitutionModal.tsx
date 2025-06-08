
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";
import { PlayerTime } from "@/types/database";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { AlertTriangle, RefreshCw, UserX } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ForcedSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerToReEnter: PlayerTime | null;
  availableForSubstitution: PlayerTime[];
  allPlayers: ProcessedPlayer[];
  onConfirmSubstitution: (playerToSubOut: PlayerTime) => void;
}

const ForcedSubstitutionModal = ({
  isOpen,
  onClose,
  playerToReEnter,
  availableForSubstitution,
  allPlayers,
  onConfirmSubstitution
}: ForcedSubstitutionModalProps) => {
  const [selectedPlayerToSubOut, setSelectedPlayerToSubOut] = useState("");

  const handleConfirm = () => {
    if (!selectedPlayerToSubOut || !playerToReEnter) return;
    
    const playerToSubOut = availableForSubstitution.find(p => p.id.toString() === selectedPlayerToSubOut);
    if (playerToSubOut) {
      onConfirmSubstitution(playerToSubOut);
      setSelectedPlayerToSubOut("");
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedPlayerToSubOut("");
    onClose();
  };

  if (!playerToReEnter) return null;

  const getPlayerInfo = (playerId: number) => {
    return allPlayers.find(p => p.id === playerId);
  };

  console.log('🔄 ForcedSubstitutionModal: Rendering forced substitution dialog:', {
    playerToReEnter: playerToReEnter.name,
    availableCount: availableForSubstitution.length,
    selectedToSubOut: selectedPlayerToSubOut
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Forced Substitution Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {playerToReEnter.name} has already played and cannot re-enter while 7 players are active.
                </p>
                <p className="text-sm">
                  You must select a player to substitute out first.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-1">
              <span className="text-sm font-medium">Player Re-entering:</span>
            </div>
            <div>
              <span className="font-semibold">{playerToReEnter.name}</span>
              <span className="text-sm text-muted-foreground ml-2">({playerToReEnter.team})</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playerToSubOut">Select Player to Substitute Out</Label>
            <EnhancedRefereeSelect 
              value={selectedPlayerToSubOut} 
              onValueChange={setSelectedPlayerToSubOut}
              placeholder={
                availableForSubstitution.length > 0 
                  ? "Choose player to substitute out" 
                  : "No players available"
              }
              disabled={availableForSubstitution.length === 0}
            >
              <EnhancedRefereeSelectContent>
                {availableForSubstitution.length === 0 ? (
                  <EnhancedRefereeSelectItem value="no-players" disabled>
                    No active players available for substitution
                  </EnhancedRefereeSelectItem>
                ) : (
                  availableForSubstitution.map((player) => {
                    const playerInfo = getPlayerInfo(player.id);
                    return (
                      <EnhancedRefereeSelectItem 
                        key={`sub-out-player-${player.id}`}
                        value={player.id.toString()}
                        playerData={{
                          name: player.name,
                          team: player.team,
                          number: playerInfo?.number || '?',
                          position: playerInfo?.role || 'Player'
                        }}
                      >
                        {player.name}
                      </EnhancedRefereeSelectItem>
                    );
                  })
                )}
              </EnhancedRefereeSelectContent>
            </EnhancedRefereeSelect>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={!selectedPlayerToSubOut || availableForSubstitution.length === 0}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Confirm Substitution
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <UserX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {availableForSubstitution.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              No active players available for substitution
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForcedSubstitutionModal;
