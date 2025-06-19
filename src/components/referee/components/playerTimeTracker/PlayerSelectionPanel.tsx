
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Play } from "lucide-react";
import PlayerRowItem from "./PlayerRowItem";
import { Button } from "@/components/ui/button";

interface PlayerSelectionPanelProps {
  teamName: string;
  players: any[];
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
  isValidSelection,
}: PlayerSelectionPanelProps) => {
  const selectedCount = selectedPlayerIds.size;

  return (
    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {teamName}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isValidSelection ? "default" : "secondary"}
              className="text-sm"
            >
              {selectedCount}/{requiredPlayers} selected
            </Badge>
          </div>
        </div>

        {selectedCount === requiredPlayers && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              Perfect! You have selected exactly {requiredPlayers} players for the starting squad.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Players List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
        {players.map((player) => {
          const isSelected = selectedPlayerIds.has(player.id);
          const canSelect = isSelected || selectedPlayerIds.size < requiredPlayers;

          return (
            <PlayerRowItem
              key={player.id}
              player={player}
              isSelected={isSelected}
              canSelect={canSelect}
              onToggle={() => onPlayerToggle(player.id, !isSelected)}
            />
          );
        })}
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 pt-3 border-t bg-background">
        {/* Responsive stack: vertical on xs (below 375px), horizontal otherwise */}
        <div className="
          flex gap-2
          flex-col xs:flex-row
          [@media(max-width:375px)]:flex-col
        ">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 w-full"
          >
            Back to Team Selection
          </Button>
          <Button
            onClick={onStart}
            disabled={!isValidSelection}
            className="flex-1 w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {/* Short label on mobile, long on desktop */}
            <span className="block [@media(max-width:375px)]:hidden">Start Match Tracking</span>
            <span className="hidden [@media(max-width:375px)]:block">Start Match</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionPanel;
