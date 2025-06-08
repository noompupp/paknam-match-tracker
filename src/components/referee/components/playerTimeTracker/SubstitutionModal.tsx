
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { Users, UserPlus, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  outgoingPlayer: {
    id: number;
    name: string;
    team: string;
  } | null;
  availablePlayers: ProcessedPlayer[];
  onSubstitute: (incomingPlayer: ProcessedPlayer) => void;
}

const SubstitutionModal = ({
  isOpen,
  onClose,
  outgoingPlayer,
  availablePlayers,
  onSubstitute
}: SubstitutionModalProps) => {
  const [selectedIncomingPlayer, setSelectedIncomingPlayer] = useState("");

  const handleSubstitute = () => {
    if (!selectedIncomingPlayer) return;
    
    const incomingPlayer = availablePlayers.find(p => p.id.toString() === selectedIncomingPlayer);
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
                availablePlayers.length > 0 
                  ? "Choose replacement player" 
                  : "No available players"
              }
              disabled={availablePlayers.length === 0}
            >
              <EnhancedRefereeSelectContent>
                {availablePlayers.length === 0 ? (
                  <EnhancedRefereeSelectItem value="no-players" disabled>
                    No available players for substitution
                  </EnhancedRefereeSelectItem>
                ) : (
                  availablePlayers.map((player) => (
                    <EnhancedRefereeSelectItem 
                      key={`sub-player-${player.id}`}
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
                  ))
                )}
              </EnhancedRefereeSelectContent>
            </EnhancedRefereeSelect>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubstitute}
              disabled={!selectedIncomingPlayer || availablePlayers.length === 0}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Make Substitution
            </Button>
            <Button
              variant="outline"
              onClick={handleSkipSubstitution}
              className="flex-1"
            >
              Skip for Now
            </Button>
          </div>

          {availablePlayers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              All eligible players are already being tracked
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubstitutionModal;
