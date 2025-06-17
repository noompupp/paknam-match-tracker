
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Check } from "lucide-react";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useTranslation } from "@/hooks/useTranslation";

interface PlayerSelectionPanelProps {
  teamName: string;
  players: ProcessedPlayer[];
  selectedPlayerIds: Set<number>;
  requiredPlayers: number;
  onPlayerToggle: (playerId: number, checked: boolean) => void;
  onBack: () => void;
  onStart: () => void;
  isValidSelection: boolean;
}

const PlayerSelectionPanel = ({
  teamName,
  players,
  selectedPlayerIds,
  requiredPlayers,
  onPlayerToggle,
  onBack,
  onStart,
  isValidSelection
}: PlayerSelectionPanelProps) => {
  const { t } = useTranslation();

  console.log('🎯 PlayerSelectionPanel Debug:', {
    teamName,
    playersCount: players.length,
    selectedCount: selectedPlayerIds.size,
    requiredPlayers,
    isValidSelection,
    selectedIds: Array.from(selectedPlayerIds)
  });

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-center flex-1">
          <h3 className="font-semibold">{teamName}</h3>
          <p className="text-sm text-muted-foreground">
            {t('referee.selectPlayers', 'Select {count} players').replace('{count}', String(requiredPlayers))}
          </p>
        </div>
        <Badge variant={isValidSelection ? "default" : "secondary"}>
          {selectedPlayerIds.size}/{requiredPlayers}
        </Badge>
      </div>

      {/* Scrollable Player List - This is the key fix */}
      <div className="flex-1 min-h-0 mb-4">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-4">
            {players.map((player) => {
              const isSelected = selectedPlayerIds.has(player.id);
              const canSelect = isSelected || selectedPlayerIds.size < requiredPlayers;
              
              return (
                <div
                  key={player.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    isSelected 
                      ? 'bg-primary/10 border-primary' 
                      : canSelect 
                      ? 'hover:bg-muted cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (canSelect) {
                      console.log('🔄 Player clicked:', { playerId: player.id, isSelected, canSelect });
                      onPlayerToggle(player.id, !isSelected);
                    }
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (canSelect) {
                        console.log('☑️ Checkbox changed:', { playerId: player.id, checked, canSelect });
                        onPlayerToggle(player.id, checked === true);
                      }
                    }}
                    disabled={!canSelect}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {player.position} {player.number && `#${player.number}`}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer - Fixed */}
      <div className="flex flex-col gap-3 pt-4 border-t flex-shrink-0">
        <div className="text-center text-sm text-muted-foreground">
          {isValidSelection 
            ? t('referee.readyToStart', 'Ready to start the match!')
            : t('referee.selectMorePlayers', 'Select {count} more players').replace(
                '{count}', 
                String(requiredPlayers - selectedPlayerIds.size)
              )
          }
        </div>
        <Button 
          onClick={() => {
            console.log('🚀 Start match clicked:', { isValidSelection, selectedCount: selectedPlayerIds.size });
            onStart();
          }}
          disabled={!isValidSelection}
          className="w-full"
          size="lg"
        >
          <Users className="h-4 w-4 mr-2" />
          {t('referee.startMatch', 'Start Match')}
        </Button>
      </div>
    </div>
  );
};

export default PlayerSelectionPanel;
