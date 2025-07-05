import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, Star, Users, Save } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TeamOfTheWeekPlayer, CaptainOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { useHybridPlayerRatings, useApprovedPlayerRatings } from "@/hooks/useHybridPlayerRatings";
import MiniPlayerAvatar from "@/components/dashboard/MiniPlayerAvatar";

interface ManualTOTWSelectionProps {
  fixtureId: number | null;
  onSelectionChange: (totw: TeamOfTheWeekPlayer[], captain: CaptainOfTheWeekPlayer | null) => void;
  initialTOTW?: TeamOfTheWeekPlayer[];
  initialCaptain?: CaptainOfTheWeekPlayer | null;
}

const ManualTOTWSelection: React.FC<ManualTOTWSelectionProps> = ({ 
  fixtureId, 
  onSelectionChange,
  initialTOTW = [],
  initialCaptain = null
}) => {
  const { t } = useTranslation();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(
    new Set(initialTOTW.map(p => p.player_id))
  );
  const [captainId, setCaptainId] = useState<number | null>(
    initialTOTW.find(p => p.isCaptain)?.player_id || null
  );

  const { data: hybridRatings } = useHybridPlayerRatings(fixtureId);
  const { data: approvedRatings } = useApprovedPlayerRatings(fixtureId);

  // Get approved player ratings only
  const approvedMap = new Map(
    (approvedRatings || []).map(rating => [rating.player_id, rating])
  );

  const availablePlayers = (hybridRatings || []).filter(rating => 
    approvedMap.has(rating.player_id)
  ).sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating);

  const handlePlayerToggle = (playerId: number) => {
    const newSelected = new Set(selectedPlayers);
    
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
      // If removing captain, clear captain selection
      if (captainId === playerId) {
        setCaptainId(null);
      }
    } else if (newSelected.size < 7) {
      newSelected.add(playerId);
    }
    
    setSelectedPlayers(newSelected);
  };

  const handleCaptainChange = (playerId: number) => {
    // Captain must be selected in TOTW
    if (selectedPlayers.has(playerId)) {
      setCaptainId(captainId === playerId ? null : playerId);
    }
  };

  const handleSave = () => {
    const selectedTOTW: TeamOfTheWeekPlayer[] = availablePlayers
      .filter(player => selectedPlayers.has(player.player_id))
      .map(player => ({
        ...player,
        isCaptain: player.player_id === captainId,
        approvedRating: approvedMap.get(player.player_id)
      }));

    onSelectionChange(selectedTOTW, null); // Manual selection doesn't affect captain of the week
  };

  if (!availablePlayers.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No approved player ratings available for manual selection
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manual Team Selection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select up to 7 players for your custom Team of the Week. Choose 1 captain from selected players.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Selected: {selectedPlayers.size}/7 players
              {captainId && " • Captain selected"}
            </div>
            <Button 
              onClick={handleSave}
              disabled={selectedPlayers.size === 0}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Selection
            </Button>
          </div>
          
          <div className="grid gap-3">
            {availablePlayers.map((player) => {
              const isSelected = selectedPlayers.has(player.player_id);
              const isCaptain = captainId === player.player_id;
              
              return (
                <div
                  key={player.player_id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handlePlayerToggle(player.player_id)}
                    disabled={!isSelected && selectedPlayers.size >= 7}
                  />
                  
                  <div className="w-10 h-10 flex-shrink-0">
                    <MiniPlayerAvatar
                      name={player.player_name}
                      imageUrl={null}
                      size={40}
                      className={isCaptain ? 'ring-2 ring-yellow-400' : ''}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.player_name}</span>
                      {isCaptain && (
                        <Crown className="h-4 w-4 text-yellow-600 fill-yellow-400" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.team_name} • {player.position}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {player.rating_data.final_rating.toFixed(1)}
                      </span>
                    </div>
                    
                    <Badge variant="outline">
                      {player.position}
                    </Badge>
                    
                    {isSelected && (
                      <Button
                        variant={isCaptain ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCaptainChange(player.player_id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Crown className="h-3 w-3" />
                        {isCaptain ? "Captain" : "Make Captain"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualTOTWSelection;