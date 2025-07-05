import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Star, Users, Save, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MiniPlayerAvatar from "@/components/dashboard/MiniPlayerAvatar";
import type { TeamOfTheWeekPlayer, CaptainOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";

interface SimplifiedTOTWSelectionProps {
  onSelectionChange: (totw: TeamOfTheWeekPlayer[], captain: CaptainOfTheWeekPlayer | null) => void;
  initialTOTW?: TeamOfTheWeekPlayer[];
  initialCaptain?: CaptainOfTheWeekPlayer | null;
}

interface PlayerOption {
  id: number;
  name: string;
  team_name: string;
  position: string;
  avatar_url?: string;
  rating: number;
}

const SimplifiedTOTWSelection: React.FC<SimplifiedTOTWSelectionProps> = ({
  onSelectionChange,
  initialTOTW = [],
  initialCaptain = null
}) => {
  const { t } = useTranslation();
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerOption[]>(
    initialTOTW.map(p => ({
      id: p.player_id,
      name: p.player_name,
      team_name: p.team_name,
      position: p.position,
      rating: p.rating_data.final_rating
    }))
  );
  const [captainId, setCaptainId] = useState<number | null>(
    initialTOTW.find(p => p.isCaptain)?.player_id || null
  );

  // Fetch all players with ratings
  const { data: allPlayers = [], isLoading } = useQuery({
    queryKey: ['all-players-for-totw'],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from('members')
        .select('id, name, team_id, position, ProfileURL, optimized_avatar_url')
        .order('name');
      
      if (error) throw error;

      // Get team names
      const teamIds = [...new Set(members?.map(m => m.team_id).filter(Boolean))];
      const { data: teams } = await supabase
        .from('teams')
        .select('__id__, name')
        .in('__id__', teamIds);

      const teamMap = new Map(teams?.map(t => [t.__id__, t.name]) || []);

      return (members || []).map(member => ({
        id: member.id,
        name: member.name || 'Unknown',
        team_name: teamMap.get(member.team_id) || member.team_id || 'Unknown Team',
        position: member.position || 'Player',
        avatar_url: member.ProfileURL || member.optimized_avatar_url,
        rating: 7.0 // Default rating for manual selection
      }));
    },
  });

  // Position categories for better organization
  const positionCategories = {
    'GK': allPlayers.filter(p => p.position.toUpperCase().includes('GK')),
    'DF': allPlayers.filter(p => p.position.toUpperCase().includes('DF')),
    'MF': allPlayers.filter(p => p.position.toUpperCase().includes('MF')),
    'FW': allPlayers.filter(p => p.position.toUpperCase().includes('FW')),
    'Other': allPlayers.filter(p => !['GK', 'DF', 'MF', 'FW'].some(pos => p.position.toUpperCase().includes(pos)))
  };

  const handlePlayerAdd = (playerId: string) => {
    const player = allPlayers.find(p => p.id === parseInt(playerId));
    if (!player || selectedPlayers.length >= 7) return;

    if (!selectedPlayers.some(p => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handlePlayerRemove = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
    if (captainId === playerId) {
      setCaptainId(null);
    }
  };

  const handleCaptainChange = (playerId: number) => {
    setCaptainId(captainId === playerId ? null : playerId);
  };

  const handleSave = () => {
    const totwPlayers: TeamOfTheWeekPlayer[] = selectedPlayers.map(player => ({
      player_id: player.id,
      player_name: player.name,
      team_id: `team_${player.id}`, // Mock team ID
      team_name: player.team_name,
      position: player.position,
      rating_data: {
        player_id: player.id,
        player_name: player.name,
        team_id: `team_${player.id}`,
        position: player.position,
        minutes_played: 90,
        match_result: 'manual',
        fpl_points: 8,
        fpl_rating: player.rating,
        participation_rating: player.rating,
        final_rating: player.rating,
        rating_breakdown: {
          goals_conceded: 0,
          clean_sheet_eligible: ['GK', 'DF'].includes(player.position)
        }
      },
      isCaptain: player.id === captainId
    }));

    onSelectionChange(totwPlayers, null);
  };

  const handleClear = () => {
    setSelectedPlayers([]);
    setCaptainId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading players...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Team Selection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select up to 7 players for your Team of the Week. Choose positions to see available players.
          </p>
        </CardHeader>
      </Card>

      {/* Selected Players */}
      {selectedPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Players ({selectedPlayers.length}/7)</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button onClick={handleSave} disabled={selectedPlayers.length === 0}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Team
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {selectedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                >
                  <div className="w-10 h-10 flex-shrink-0">
                    <MiniPlayerAvatar
                      name={player.name}
                      imageUrl={player.avatar_url}
                      size={40}
                      className={player.id === captainId ? 'ring-2 ring-yellow-400' : ''}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.name}</span>
                      {player.id === captainId && (
                        <Crown className="h-4 w-4 text-yellow-600 fill-yellow-400" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.team_name} • {player.position}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{player.position}</Badge>
                    <Button
                      variant={player.id === captainId ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCaptainChange(player.id)}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      {player.id === captainId ? "Captain" : "Make Captain"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePlayerRemove(player.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Selection by Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(positionCategories).map(([positionKey, players]) => (
          players.length > 0 && (
            <Card key={positionKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {positionKey === 'GK' ? 'Goalkeepers' :
                   positionKey === 'DF' ? 'Defenders' :
                   positionKey === 'MF' ? 'Midfielders' :
                   positionKey === 'FW' ? 'Forwards' : 'Other'}
                  <Badge variant="secondary" className="ml-2">
                    {players.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  onValueChange={handlePlayerAdd}
                  disabled={selectedPlayers.length >= 7}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Add ${positionKey} player`} />
                  </SelectTrigger>
                  <SelectContent>
                    {players
                      .filter(p => !selectedPlayers.some(sp => sp.id === p.id))
                      .map(player => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{player.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {player.team_name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )
        ))}
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Quick Selection Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Select players from different positions for a balanced team</li>
              <li>Choose one captain from your selected players</li>
              <li>You can select up to 7 players total</li>
              <li>Use the position categories to find players quickly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedTOTWSelection;