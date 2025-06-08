
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { Users, UserPlus, AlertTriangle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnhancedAvailablePlayers } from "./reSubstitutionUtils";

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  outgoingPlayer: {
    id: number;
    name: string;
    team: string;
  } | null;
  enhancedAvailablePlayers: EnhancedAvailablePlayers;
  onSubstitute: (incomingPlayer: ProcessedPlayer) => void;
}

const SubstitutionModal = ({
  isOpen,
  onClose,
  outgoingPlayer,
  enhancedAvailablePlayers,
  onSubstitute
}: SubstitutionModalProps) => {
  const [selectedIncomingPlayer, setSelectedIncomingPlayer] = useState("");

  const { newPlayers, reSubstitutionPlayers, canReSubstitute } = enhancedAvailablePlayers;
  const allAvailablePlayers = [...newPlayers, ...reSubstitutionPlayers];
  const hasAnyPlayers = allAvailablePlayers.length > 0;

  const handleSubstitute = () => {
    if (!selectedIncomingPlayer) return;
    
    const incomingPlayer = allAvailablePlayers.find(p => p.id.toString() === selectedIncomingPlayer);
    if (incomingPlayer) {
      onSubstitute(incomingPlayer);
      setSelectedIncomingPlayer("");
      onClose();
    }
  };

  const handleSkipSubstitution = () => {
    setSelectedIncomingPlayer("");
    onClose();
  };

  const isReSubstitutionPlayer = (playerId: string) => {
    return reSubstitutionPlayers.some(p => p.id.toString() === playerId);
  };

  if (!outgoingPlayer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Substitution Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">{outgoingPlayer.name}</span> has been substituted out. 
              Select a replacement player to maintain the squad.
            </AlertDescription>
          </Alert>

          {/* Re-substitution feature indicator */}
          {canReSubstitute && (
            <Alert>
              <RotateCcw className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Re-substitution available - 8+ players have participated</span>
                  <Badge variant="outline" className="text-xs">
                    Enhanced Mode
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-sm font-medium">Outgoing Player:</span>
            </div>
            <div className="mt-1">
              <span className="font-semibold">{outgoingPlayer.name}</span>
              <span className="text-sm text-muted-foreground ml-2">({outgoingPlayer.team})</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomingPlayer">Select Replacement Player</Label>
            <EnhancedRefereeSelect 
              value={selectedIncomingPlayer} 
              onValueChange={setSelectedIncomingPlayer}
              placeholder={
                hasAnyPlayers 
                  ? "Choose replacement player" 
                  : "No available players"
              }
              disabled={!hasAnyPlayers}
            >
              <EnhancedRefereeSelectContent>
                {!hasAnyPlayers ? (
                  <EnhancedRefereeSelectItem value="no-players" disabled>
                    No available players for substitution
                  </EnhancedRefereeSelectItem>
                ) : (
                  <>
                    {/* New Players Section */}
                    {newPlayers.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-3 w-3" />
                            New Players ({newPlayers.length})
                          </div>
                        </div>
                        {newPlayers.map((player) => (
                          <EnhancedRefereeSelectItem 
                            key={`new-player-${player.id}`}
                            value={player.id.toString()}
                            playerData={{
                              name: player.name,
                              team: player.team,
                              number: player.number || '?',
                              position: player.role
                            }}
                          >
                            {player.name}
                          </EnhancedRefereeSelectItem>
                        ))}
                      </>
                    )}

                    {/* Re-substitution Section */}
                    {canReSubstitute && reSubstitutionPlayers.length > 0 && (
                      <>
                        {newPlayers.length > 0 && (
                          <div className="px-3">
                            <Separator />
                          </div>
                        )}
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-blue-50">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="h-3 w-3" />
                            Re-substitution ({reSubstitutionPlayers.length})
                          </div>
                        </div>
                        {reSubstitutionPlayers.map((player) => (
                          <EnhancedRefereeSelectItem 
                            key={`resub-player-${player.id}`}
                            value={player.id.toString()}
                            playerData={{
                              name: player.name,
                              team: player.team,
                              number: player.number || '?',
                              position: player.role
                            }}
                            className="bg-blue-50/50"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{player.name}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                Re-sub
                              </Badge>
                            </div>
                          </EnhancedRefereeSelectItem>
                        ))}
                      </>
                    )}
                  </>
                )}
              </EnhancedRefereeSelectContent>
            </EnhancedRefereeSelect>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubstitute}
              disabled={!selectedIncomingPlayer || !hasAnyPlayers}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {selectedIncomingPlayer && isReSubstitutionPlayer(selectedIncomingPlayer) 
                ? "Re-substitute" 
                : "Make Substitution"
              }
            </Button>
            <Button
              variant="outline"
              onClick={handleSkipSubstitution}
              className="flex-1"
            >
              Skip for Now
            </Button>
          </div>

          {!hasAnyPlayers && (
            <p className="text-xs text-muted-foreground text-center">
              All eligible players are already being tracked
            </p>
          )}

          {/* Enhanced feedback */}
          {canReSubstitute && (
            <div className="text-xs text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <RotateCcw className="h-3 w-3" />
                <span>Players marked OFF can now be re-substituted back in</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubstitutionModal;
