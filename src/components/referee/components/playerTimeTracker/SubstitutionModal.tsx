
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { Users, UserPlus, AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/hooks/useTranslation";

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
  onUndoSubOut?: () => void; // New prop for undoing the Sub Out action
}

const SubstitutionModal = ({
  isOpen,
  onClose,
  outgoingPlayer,
  availablePlayers,
  onSubstitute,
  onUndoSubOut
}: SubstitutionModalProps) => {
  const { t } = useTranslation();
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

  const handleUndoClose = () => {
    setSelectedIncomingPlayer("");
    if (onUndoSubOut) {
      onUndoSubOut();
    }
    onClose();
  };

  if (!outgoingPlayer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleUndoClose}>
      <DialogContent className="max-w-md mobile-substitution-modal">
        {/* Custom close button with undo functionality */}
        <button
          onClick={handleUndoClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          aria-label={t("subModal.undoAndClose", "Undo and close")}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t("subModal.undoAndClose", "Undo and close")}</span>
        </button>

        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("subModal.title", "Select Replacement Player")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t("subModal.alertOutDescription", "{name} has been substituted out. Select a replacement player to complete the substitution.", { name: outgoingPlayer.name })}
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-sm font-medium">{t("subModal.outgoingPlayerLabel", "Outgoing Player")}:</span>
            </div>
            <div className="mt-1">
              <span className="font-semibold">{outgoingPlayer.name}</span>
              <span className="text-sm text-muted-foreground ml-2">({outgoingPlayer.team})</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomingPlayer">{t("subModal.selectReplacementLabel", "Select Replacement Player")}</Label>
            <EnhancedRefereeSelect 
              value={selectedIncomingPlayer} 
              onValueChange={setSelectedIncomingPlayer}
              placeholder={
                availablePlayers.length > 0 
                  ? t("subModal.selectReplacementPlaceholder", "Choose replacement player")
                  : t("subModal.noAvailablePlayers", "No available players for substitution")
              }
              disabled={availablePlayers.length === 0}
              className="mobile-optimized-select"
            >
              <EnhancedRefereeSelectContent className="mobile-select-content-optimized">
                {availablePlayers.length === 0 ? (
                  <EnhancedRefereeSelectItem value="no-players" disabled>
                    {t("subModal.noAvailablePlayers", "No available players for substitution")}
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
              className="flex-1 mobile-action-button"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t("subModal.completeBtn", "Complete Substitution")}
            </Button>
          </div>

          {availablePlayers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {t("subModal.allTracked", "All eligible players are already being tracked")}
            </p>
          )}

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            {t("subModal.tipUndo", 'Tip: Click the X to undo the substitution and return {name} to play', { name: outgoingPlayer.name })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubstitutionModal;
