import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Star, Users, Save, Trash2, Award } from "lucide-react";
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
  is_captain: boolean;
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
      rating: p.rating_data.final_rating,
      is_captain: p.isCaptain
    }))
  );
  const [captainId, setCaptainId] = useState<number | null>(
    initialTOTW.find(p => p.isCaptain)?.player_id || null
  );
  const [captainOfTheWeek, setCaptainOfTheWeek] = useState<PlayerOption | null>(null);

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
        rating: 7.0, // Default rating for manual selection
        is_captain: false
      }));
    },
  });

  // Position categories - cleaner organization with proper filtering
  const positionCategories = {
    'GK': allPlayers.filter(p => p.position.toUpperCase().includes('GK') || p.position.toUpperCase().includes('GOALKEEPER')),
    'DF': allPlayers.filter(p => p.position.toUpperCase().includes('DF') || p.position.toUpperCase().includes('DEF') || p.position.toUpperCase().includes('CB') || p.position.toUpperCase().includes('LB') || p.position.toUpperCase().includes('RB')),
    'MF': allPlayers.filter(p => p.position.toUpperCase().includes('MF') || p.position.toUpperCase().includes('MID') || p.position.toUpperCase().includes('CM') || p.position.toUpperCase().includes('CDM') || p.position.toUpperCase().includes('CAM')),
    'FW': allPlayers.filter(p => p.position.toUpperCase().includes('FW') || p.position.toUpperCase().includes('FORWARD') || p.position.toUpperCase().includes('ST') || p.position.toUpperCase().includes('CF') || p.position.toUpperCase().includes('STRIKER'))
  };

  const handlePlayerAdd = (playerId: string) => {
    const player = allPlayers.find(p => p.id === parseInt(playerId));
    if (!player || selectedPlayers.length >= 7) return;

    if (!selectedPlayers.some(p => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, { ...player, is_captain: false }]);
    }
  };

  const handlePlayerRatingChange = (playerId: number, newRating: number) => {
    setSelectedPlayers(selectedPlayers.map(p => 
      p.id === playerId ? { ...p, rating: newRating } : p
    ));
  };

  const handlePlayerRemove = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
    if (captainId === playerId) {
      setCaptainId(null);
    }
    if (captainOfTheWeek?.id === playerId) {
      setCaptainOfTheWeek(null);
    }
  };

  const handleCaptainChange = (playerId: number) => {
    setCaptainId(captainId === playerId ? null : playerId);
  };

  const handleCaptainOfTheWeekChange = (playerId: string) => {
    const player = allPlayers.find(p => p.id === parseInt(playerId));
    if (player) {
      setCaptainOfTheWeek(captainOfTheWeek?.id === player.id ? null : player);
    }
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
        fpl_points: Math.round(player.rating),
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

    const captainOfWeek: CaptainOfTheWeekPlayer | null = captainOfTheWeek ? {
      player_id: captainOfTheWeek.id,
      player_name: captainOfTheWeek.name,
      team_id: `team_${captainOfTheWeek.id}`,
      team_name: captainOfTheWeek.team_name,
      position: captainOfTheWeek.position,
      teamPerformanceScore: captainOfTheWeek.rating * 10,
      isTeamCaptain: true,
      rating_data: {
        player_id: captainOfTheWeek.id,
        player_name: captainOfTheWeek.name,
        team_id: `team_${captainOfTheWeek.id}`,
        position: captainOfTheWeek.position,
        minutes_played: 90,
        match_result: 'manual',
        fpl_points: Math.round(captainOfTheWeek.rating),
        fpl_rating: captainOfTheWeek.rating,
        participation_rating: captainOfTheWeek.rating,
        final_rating: captainOfTheWeek.rating,
        rating_breakdown: {
          goals_conceded: 0,
          clean_sheet_eligible: ['GK', 'DF'].includes(captainOfTheWeek.position)
        }
      }
    } : null;

    onSelectionChange(totwPlayers, captainOfWeek);
  };

  const handleClear = () => {
    setSelectedPlayers([]);
    setCaptainId(null);
    setCaptainOfTheWeek(null);
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
                   <div className="w-12 h-12 flex-shrink-0">
                     <MiniPlayerAvatar
                       name={player.name}
                       imageUrl={player.avatar_url}
                       size={46}
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
                   
                   <div className="flex items-center gap-3">
                     {/* Manual Rating Input */}
                     <div className="flex flex-col items-center gap-1">
                       <Label className="text-xs">Rating</Label>
                       <Input
                         type="number"
                         min="0"
                         max="10"
                         step="0.1"
                         value={player.rating}
                         onChange={(e) => handlePlayerRatingChange(player.id, parseFloat(e.target.value) || 0)}
                         className="w-16 h-8 text-center text-sm"
                       />
                     </div>
                     
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

      {/* Captain of the Week Selection */}
      <Card className="border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Captain of the Week Selection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a team captain (separate from TOTW captain) based on leadership and team performance.
          </p>
        </CardHeader>
        <CardContent>
          {captainOfTheWeek ? (
            <div className="flex items-center gap-4 p-3 rounded-lg border-2 border-blue-300 bg-blue-100">
              <div className="w-12 h-12 flex-shrink-0">
                <MiniPlayerAvatar
                  name={captainOfTheWeek.name}
                  imageUrl={captainOfTheWeek.avatar_url}
                  size={46}
                  className="ring-2 ring-blue-400"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{captainOfTheWeek.name}</span>
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {captainOfTheWeek.team_name} • {captainOfTheWeek.position}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600">Captain</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCaptainOfTheWeek(null)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Select onValueChange={handleCaptainOfTheWeekChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Captain of the Week" />
                </SelectTrigger>
                <SelectContent>
                  {allPlayers
                    .filter(p => !selectedPlayers.some(sp => sp.id === p.id)) // Exclude TOTW players
                    .map(player => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {player.team_name} • {player.position}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-blue-700">
                Select a player who demonstrated exceptional leadership qualities during the week.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Selection by Position - Cleaner 4-Category Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(positionCategories).map(([positionKey, players]) => (
          players.length > 0 && (
            <Card key={positionKey} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>
                    {positionKey === 'GK' ? 'Goalkeepers' :
                     positionKey === 'DF' ? 'Defenders' :
                     positionKey === 'MF' ? 'Midfielders' :
                     positionKey === 'FW' ? 'Forwards' : 'Other'}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {players.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  onValueChange={handlePlayerAdd}
                  disabled={selectedPlayers.length >= 7}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Add ${positionKey}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {players
                      .filter(p => !selectedPlayers.some(sp => sp.id === p.id))
                      .map(player => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium">{player.name}</span>
                            <span className="text-xs text-muted-foreground truncate">
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

      {/* Enhanced Instructions */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="py-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-3">📋 Quick Selection Guide:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-2">Team of the Week:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                  <li>Select up to 7 players total</li>
                  <li>Choose from 4 position categories</li>
                  <li>Adjust individual player ratings (0-10)</li>
                  <li>Designate one TOTW captain</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Captain of the Week:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                  <li>Select from players not in TOTW</li>
                  <li>Based on leadership qualities</li>
                  <li>Independent of performance rating</li>
                  <li>Optional selection</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedTOTWSelection;