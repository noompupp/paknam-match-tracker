
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { Users, UserPlus, AlertTriangle, RotateCcw, ArrowLeftRight } from "lucide-react";
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
  actionType?: string;
  isReSubstitution?: boolean;
}

const SubstitutionModal = ({
  isOpen,
  onClose,
  outgoingPlayer,
  enhancedAvailablePlayers,
  onSubstitute,
  actionType = 'toggle',
  isReSubstitution = false
}: SubstitutionModalProps) => {
  const [selectedIncomingPlayer, setSelectedIncomingPlayer] = useState("");

  // Use the enhanced available players format only
  const { newPlayers = [], reSubstitutionPlayers = [], canReSubstitute = false } = enhancedAvailablePlayers;

  const allAvailablePlayers = [...newPlayers, ...reSubstitutionPlayers];
  const hasAnyPlayers = allAvailablePlayers.length > 0;

  console.log('🔄 SubstitutionModal: Rendering with enhanced players:', {
    actionType,
    isReSubstitution,
    newPlayers: newPlayers.length,
    reSubstitutionPlayers: reSubstitutionPlayers.length,
    canReSubstitute,
    hasAnyPlayers,
    selectedPlayer: selectedIncomingPlayer
  });

  const handleSubstitute = () => {
    if (!selectedIncomingPlayer) return;
    
    const incomingPlayer = allAvailablePlayers.find(p => p.id.toString() === selectedIncomingPlayer);
    if (incomingPlayer) {
      console.log('✅ SubstitutionModal: Making substitution:', {
        actionType,
        outgoing: outgoingPlayer?.name,
        incoming: incomingPlayer.name,
        isReSubstitution: reSubstitutionPlayers.some(p => p.id.toString() === selectedIncomingPlayer)
      });
      
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

  const getModalTitle = () => {
    if (actionType === 're-substitution') {
      return 'Re-Substitution Required';
    }
    if (actionType === 'automatic') {
      return 'Automatic Substitution';
    }
    return 'Substitution Required';
  };

  const getModalIcon = () => {
    if (actionType === 're-substitution') {
      return <ArrowLeftRight className="h-5 w-5" />;
    }
    return <Users className="h-5 w-5" />;
  };

  const getAlertMessage = () => {
    if (actionType === 're-substitution') {
      return 'Field is full. You must remove another player before this re-entry can proceed.';
    }
    if (outgoingPlayer) {
      return (
        <>
          <span className="font-medium">{outgoingPlayer.name}</span> has been substituted out. 
          Select a replacement player to maintain the squad.
        </>
      );
    }
    return 'Select a replacement player to complete the substitution.';
  };

  if (!outgoingPlayer && actionType !== 're-substitution') return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getModalIcon()}
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant={actionType === 're-substitution' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getAlertMessage()}
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

          {/* Special indicator for re-substitution enforcement */}
          {actionType === 're-substitution' && (
            <Alert>
              <ArrowLeftRight className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Re-substitution enforcement: Must maintain 7 players on field</span>
                  <Badge variant="destructive" className="text-xs">
                    Field Full
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {outgoingPlayer && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <span className="text-sm font-medium">
                  {actionType === 're-substitution' ? 'Player to Remove:' : 'Outgoing Player:'}
                </span>
              </div>
              <div className="mt-1">
                <span className="font-semibold">{outgoingPlayer.name}</span>
                <span className="text-sm text-muted-foreground ml-2">({outgoingPlayer.team})</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="incomingPlayer">
              {actionType === 're-substitution' ? 'Select Player to Remove' : 'Select Replacement Player'}
            </Label>
            <EnhancedRefereeSelect 
              value={selectedIncomingPlayer} 
              onValueChange={(value) => {
                console.log('🎯 SubstitutionModal: Player selected:', value);
                setSelectedIncomingPlayer(value);
              }}
              placeholder={
                hasAnyPlayers 
                  ? actionType === 're-substitution' ? "Choose player to remove" : "Choose replacement player"
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
                : actionType === 're-substitution' 
                  ? "Remove Player"
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

          {/* Re-substitution enforcement explanation */}
          {actionType === 're-substitution' && (
            <div className="text-xs text-center text-muted-foreground bg-blue-50 p-2 rounded">
              <div className="flex items-center justify-center gap-1">
                <ArrowLeftRight className="h-3 w-3" />
                <span>Re-substitution enforcement ensures exactly 7 players on field</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubstitutionModal;
