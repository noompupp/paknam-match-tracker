import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Users, Crown, Star, Award } from "lucide-react";
import type { PlayerRatingRow, ApprovedRating } from "@/hooks/useHybridPlayerRatings";
import type { TeamOfTheWeekPlayer, CaptainOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";

interface ManualTOTWSelectionProps {
  availablePlayers: PlayerRatingRow[];
  approvedMap: Map<number, ApprovedRating>;
  currentTOTW: TeamOfTheWeekPlayer[];
  currentCaptain: CaptainOfTheWeekPlayer | null;
  onTOTWChange: (totw: TeamOfTheWeekPlayer[]) => void;
  onCaptainChange: (captain: CaptainOfTheWeekPlayer | null) => void;
}

const ManualTOTWSelection: React.FC<ManualTOTWSelectionProps> = ({
  availablePlayers,
  approvedMap,
  currentTOTW,
  currentCaptain,
  onTOTWChange,
  onCaptainChange
}) => {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(
    new Set(currentTOTW.map(p => p.player_id))
  );
  const [selectedCaptainId, setSelectedCaptainId] = useState<number | null>(
    currentCaptain?.player_id || null
  );

  const handlePlayerToggle = (playerId: number) => {
    const newSelection = new Set(selectedPlayerIds);
    
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId);
    } else if (newSelection.size < 7) {
      newSelection.add(playerId);
    }
    
    setSelectedPlayerIds(newSelection);
    updateTOTW(newSelection);
  };

  const handleCaptainChange = (playerId: number) => {
    setSelectedCaptainId(playerId);
    updateCaptain(playerId);
  };

  const updateTOTW = (playerIds: Set<number>) => {
    const selectedPlayers = availablePlayers.filter(player => 
      playerIds.has(player.player_id)
    );
    
    // Sort by rating and create TOTW objects
    const totw: TeamOfTheWeekPlayer[] = selectedPlayers
      .sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating)
      .map((player, index) => ({
        ...player,
        isCaptain: index === 0, // Highest rated is captain by default
        approvedRating: approvedMap.get(player.player_id)
      }));
    
    onTOTWChange(totw);
  };

  const updateCaptain = (playerId: number) => {
    const player = availablePlayers.find(p => p.player_id === playerId);
    if (player) {
      const captain: CaptainOfTheWeekPlayer = {
        ...player,
        approvedRating: approvedMap.get(player.player_id),
        isTeamCaptain: true,
        teamPerformanceScore: player.rating_data.final_rating * 1.5 // Simple scoring
      };
      onCaptainChange(captain);
    }
  };

  const handleQuickFill = () => {
    // Auto-select top 7 players by rating
    const topPlayers = [...availablePlayers]
      .sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating)
      .slice(0, 7);
    
    const newSelection = new Set(topPlayers.map(p => p.player_id));
    setSelectedPlayerIds(newSelection);
    updateTOTW(newSelection);
  };

  const handleClear = () => {
    setSelectedPlayerIds(new Set());
    onTOTWChange([]);
  };

  // Group players by position for better organization
  const playersByPosition = availablePlayers.reduce((acc, player) => {
    const position = player.position || 'Unknown';
    if (!acc[position]) acc[position] = [];
    acc[position].push(player);
    return acc;
  }, {} as Record<string, PlayerRatingRow[]>);

  // Sort positions in logical order
  const positionOrder = ['GK', 'DF', 'MF', 'WG', 'FW'];
  const sortedPositions = Object.keys(playersByPosition).sort((a, b) => {
    const aIndex = positionOrder.findIndex(pos => a.includes(pos));
    const bIndex = positionOrder.findIndex(pos => b.includes(pos));
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Get eligible captains (players not in TOTW)
  const eligibleCaptains = availablePlayers.filter(player => 
    !selectedPlayerIds.has(player.player_id)
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manual Selection Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Selected: {selectedPlayerIds.size}/7 players
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClear}>
                Clear All
              </Button>
              <Button variant="outline" size="sm" onClick={handleQuickFill}>
                Auto-Fill Top 7
              </Button>
            </div>
          </div>
          
          {selectedPlayerIds.size === 7 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-green-800 text-sm">
                ✅ Team complete! You have selected 7 players for the Team of the Week.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Select Team of the Week Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedPositions.map(position => (
              <div key={position}>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">{position}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ({playersByPosition[position].length} players)
                  </span>
                </h4>
                
                <div className="grid gap-2">
                  {playersByPosition[position]
                    .sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating)
                    .map(player => (
                      <div 
                        key={player.player_id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          selectedPlayerIds.has(player.player_id) 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'hover:bg-muted/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedPlayerIds.has(player.player_id)}
                            onCheckedChange={() => handlePlayerToggle(player.player_id)}
                            disabled={!selectedPlayerIds.has(player.player_id) && selectedPlayerIds.size >= 7}
                          />
                          <div>
                            <div className="font-medium">{player.player_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {player.team_name}
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="font-bold">
                          {player.rating_data.final_rating.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Captain Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Select Captain of the Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Captain must be a team captain who is NOT in the Team of the Week
          </div>
          
          {eligibleCaptains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No eligible captains available</p>
              <p className="text-xs mt-1">All approved players are in the Team of the Week</p>
            </div>
          ) : (
            <RadioGroup
              value={selectedCaptainId?.toString() || ''}
              onValueChange={(value) => handleCaptainChange(Number(value))}
            >
              <div className="space-y-2">
                {eligibleCaptains
                  .sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating)
                  .slice(0, 10) // Show top 10 eligible
                  .map(player => (
                    <div key={player.player_id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/20">
                      <RadioGroupItem 
                        value={player.player_id.toString()} 
                        id={`captain-${player.player_id}`}
                      />
                      <Label 
                        htmlFor={`captain-${player.player_id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{player.player_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {player.team_name} • {player.position}
                            </div>
                          </div>
                          <Badge variant="secondary" className="font-bold">
                            {player.rating_data.final_rating.toFixed(2)}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualTOTWSelection;