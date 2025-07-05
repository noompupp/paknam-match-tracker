import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Clock } from "lucide-react";
import { useCreateMatchEvent } from "@/hooks/useMatchEvents";
import { useToast } from "@/hooks/use-toast";
import { useTeams } from "@/hooks/useTeams";
import { MatchEvent } from "@/types/database";
import ScoreConsistencyValidator from "@/components/shared/ScoreConsistencyValidator";

interface ManualEventFormProps {
  fixtureId: number;
  matchTime: number;
  formatTime: (seconds: number) => string;
  homeTeamId: string;
  awayTeamId: string;
  allPlayers: any[];
}

const ManualEventForm = ({
  fixtureId,
  matchTime,
  formatTime,
  homeTeamId,
  awayTeamId,
  allPlayers
}: ManualEventFormProps) => {
  const [eventType, setEventType] = useState<string>("");
  const [playerName, setPlayerName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [eventTime, setEventTime] = useState(matchTime);
  const [description, setDescription] = useState("");
  const [cardType, setCardType] = useState("");
  const [isOwnGoal, setIsOwnGoal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const createEvent = useCreateMatchEvent();
  const { toast } = useToast();
  const { data: teams } = useTeams();

  // ENHANCED: Simplified team name resolution with comprehensive fallbacks
  const getTeamName = (teamId: string) => {
    console.log('🏷️ ManualEventForm - getTeamName called (ENHANCED):', {
      teamId,
      teamIdType: typeof teamId,
      teamsAvailable: !!teams,
      teamsCount: teams?.length || 0
    });
    
    if (!teams || !teamId) {
      console.log('🏷️ ManualEventForm - No teams or teamId, returning fallback');
      return `Team ${teamId}`;
    }
    
    // ENHANCED: Multiple resolution strategies for maximum compatibility
    const team = teams.find(t => {
      // Strategy 1: Direct __id__ match (most common)
      if (t.__id__ === teamId) return true;
      
      // Strategy 2: Numeric ID to string match
      if (t.id?.toString() === teamId) return true;
      
      // Strategy 3: Name match (legacy support)  
      if (t.name === teamId) return true;
      
      // Strategy 4: Case-insensitive name match
      if (t.name?.toLowerCase() === teamId.toLowerCase()) return true;
      
      return false;
    });
    
    const result = team?.name || `Team ${teamId}`;
    console.log('🏷️ ManualEventForm - getTeamName result (ENHANCED):', {
      foundTeam: !!team,
      teamName: team?.name,
      teamId,
      result,
      matchedStrategy: team ? 
        (team.__id__ === teamId ? 'direct_id' : 
         team.id?.toString() === teamId ? 'numeric_id' : 
         team.name === teamId ? 'name_exact' : 'name_case_insensitive') : 'none'
    });
    
    return result;
  };

  // ENHANCED: Simplified team ID resolution for database operations
  const getTeamIdForDatabase = (fixtureTeamId: string) => {
    if (!teams || !fixtureTeamId) return fixtureTeamId;
    
    console.log('🏷️ ManualEventForm - getTeamIdForDatabase (ENHANCED):', {
      fixtureTeamId,
      fixtureTeamIdType: typeof fixtureTeamId
    });
    
    // Find team using the same strategy as getTeamName
    const team = teams.find(t => {
      if (t.__id__ === fixtureTeamId) return true;
      if (t.id?.toString() === fixtureTeamId) return true;
      if (t.name === fixtureTeamId) return true;
      if (t.name?.toLowerCase() === fixtureTeamId.toLowerCase()) return true;
      return false;
    });
    
    const result = team?.__id__ || fixtureTeamId;
    console.log('🏷️ ManualEventForm - getTeamIdForDatabase result (ENHANCED):', {
      fixtureTeamId,
      foundTeam: !!team,
      teamName: team?.name,
      resultId: result,
      strategy: team ? 
        (team.__id__ === fixtureTeamId ? 'direct_id' : 
         team.id?.toString() === fixtureTeamId ? 'numeric_id' : 
         team.name === fixtureTeamId ? 'name_exact' : 'name_case_insensitive') : 'fallback'
    });
    
    return result;
  };

  // CRITICAL FIX: Enhanced player filtering with proper team ID mapping
  const availablePlayers = useMemo(() => {
    if (!teamId || !allPlayers || !teams) return [];
    
    console.log('🔍 ManualEventForm - Filtering players (ENHANCED):', {
      selectedTeamId: teamId,
      selectedTeamIdType: typeof teamId,
      totalPlayers: allPlayers.length,
      totalTeams: teams.length,
      samplePlayer: allPlayers[0] ? {
        name: allPlayers[0].name,
        team_id: allPlayers[0].team_id,
        team_id_type: typeof allPlayers[0].team_id
      } : null
    });
    
    // CRITICAL: Find the actual team __id__ that corresponds to the selected teamId
    const selectedTeam = teams.find(t => {
      // Try exact __id__ match first
      if (t.__id__ === teamId) return true;
      
      // Try numeric ID to string conversion match  
      if (t.id?.toString() === teamId) return true;
      
      // Try reverse - if teamId is numeric, convert __id__ to number for comparison
      if (!isNaN(Number(teamId)) && t.__id__ && !isNaN(Number(t.__id__))) {
        return Number(t.__id__) === Number(teamId);
      }
      
      return false;
    });
    
    if (!selectedTeam) {
      console.error('🔍 ManualEventForm - Selected team not found!:', {
        teamId,
        availableTeams: teams.map(t => ({ id: t.id, __id__: t.__id__, name: t.name }))
      });
      return [];
    }
    
    const targetTeamId = selectedTeam.__id__; // Use the __id__ for player matching
    console.log('🔍 ManualEventForm - Using target team ID for filtering:', {
      selectedTeamId: teamId,
      targetTeamId,
      selectedTeamName: selectedTeam.name
    });
    
    const filtered = allPlayers.filter(player => {
      // ENHANCED: Use the mapped team __id__ for comparison
      const playerTeamId = player.team_id?.toString();
      
      const matches = [
        playerTeamId === targetTeamId,
        player.team_id === targetTeamId,
        String(player.team_id) === String(targetTeamId),
        // Additional numeric comparison fallback
        !isNaN(Number(playerTeamId)) && !isNaN(Number(targetTeamId)) && 
        Number(playerTeamId) === Number(targetTeamId)
      ];
      
      const isMatch = matches.some(Boolean);
      
      if (allPlayers.indexOf(player) < 3) { // Debug first few players
        console.log('🔍 ManualEventForm - Player match check (ENHANCED):', {
          playerName: player.name,
          playerTeamId: player.team_id,
          targetTeamId,
          matches: {
            string_exact: matches[0],
            direct_exact: matches[1], 
            string_cast: matches[2],
            numeric_fallback: matches[3]
          },
          finalMatch: isMatch
        });
      }
      
      return isMatch;
    });
    
    console.log('🔍 ManualEventForm - Enhanced filtered result:', {
      selectedTeamName: selectedTeam.name,
      targetTeamId,
      matchingPlayers: filtered.length,
      players: filtered.map(p => ({ name: p.name, team_id: p.team_id }))
    });
    
    return filtered;
  }, [teamId, allPlayers, teams]);

  // Reset player selection when team changes
  const handleTeamChange = (newTeamId: string) => {
    setTeamId(newTeamId);
    setPlayerName(""); // Reset player selection
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventType || !playerName || !teamId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // ENHANCED: Convert fixture team IDs to database-compatible team IDs
      const databaseTeamId = getTeamIdForDatabase(teamId);
      const databaseHomeTeamId = getTeamIdForDatabase(homeTeamId);
      const databaseAwayTeamId = getTeamIdForDatabase(awayTeamId);
      
      console.log('🎯 ManualEventForm - Creating event with enhanced team ID mapping:', {
        originalTeamId: teamId,
        databaseTeamId,
        originalHomeTeamId: homeTeamId,
        databaseHomeTeamId,
        originalAwayTeamId: awayTeamId,
        databaseAwayTeamId,
        eventType,
        playerName
      });

      const eventData: Omit<MatchEvent, 'id' | 'created_at'> = {
        fixture_id: fixtureId,
        event_type: eventType as any,
        player_name: playerName,
        team_id: databaseTeamId, // Use mapped team ID
        event_time: eventTime,
        description: description || `${eventType} by ${playerName}`,
        card_type: eventType.includes('card') ? (cardType as 'yellow' | 'red') : null,
        is_own_goal: eventType === 'goal' ? isOwnGoal : false,
        scoring_team_id: eventType === 'goal' && isOwnGoal 
          ? (databaseTeamId === databaseHomeTeamId ? databaseAwayTeamId : databaseHomeTeamId)
          : databaseTeamId,
        affected_team_id: databaseTeamId
      };

      await createEvent.mutateAsync(eventData);

      toast({
        title: "Event Added Successfully",
        description: `${eventType} event added for ${playerName}. Score synchronization in progress...`,
      });

      // Reset form
      setEventType("");
      setPlayerName("");
      setTeamId("");
      setEventTime(matchTime);
      setDescription("");
      setCardType("");
      setIsOwnGoal(false);
      setIsExpanded(false);

    } catch (error) {
      console.error('❌ ManualEventForm - Failed to create event:', error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Score Consistency Validator */}
      <ScoreConsistencyValidator 
        fixtureId={fixtureId} 
        onScoreFixed={() => {
          console.log('🎯 ManualEventForm - Score fixed, validation updated');
        }}
      />
      
      {/* Manual Event Form */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <Plus className="h-4 w-4" />
            Add Manual Event
            <span className="text-sm text-muted-foreground ml-auto">
              {isExpanded ? 'Click to collapse' : 'Click to expand'}
            </span>
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... keep existing form content */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">Goal</SelectItem>
                      <SelectItem value="assist">Assist</SelectItem>
                      <SelectItem value="yellow_card">Yellow Card</SelectItem>
                      <SelectItem value="red_card">Red Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team">Team *</Label>
                  <Select value={teamId} onValueChange={handleTeamChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={homeTeamId}>{getTeamName(homeTeamId)}</SelectItem>
                      <SelectItem value={awayTeamId}>{getTeamName(awayTeamId)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="player">Player *</Label>
                  <Select value={playerName} onValueChange={setPlayerName}>
                    <SelectTrigger>
                      <SelectValue placeholder={teamId ? "Select player" : "Select a team first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.length > 0 ? (
                        availablePlayers.map((player) => (
                          <SelectItem 
                            key={`player-${player.id}-${player.name}`} 
                            value={player.name}
                          >
                            {player.name} ({player.position || 'Player'})
                          </SelectItem>
                        ))
                    ) : teamId ? (
                      <SelectItem value="no-players" disabled>
                        No players found for this team
                      </SelectItem>
                    ) : (
                      <SelectItem value="no-team" disabled>
                        Select a team first
                      </SelectItem>
                    )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventTime" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Event Time (seconds)
                  </Label>
                  <Input
                    type="number"
                    value={eventTime}
                    onChange={(e) => setEventTime(parseInt(e.target.value) || 0)}
                    min={0}
                    max={7200}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(eventTime)}
                  </span>
                </div>
              </div>

              {eventType.includes('card') && (
                <div className="space-y-2">
                  <Label htmlFor="cardType">Card Type *</Label>
                  <Select value={cardType} onValueChange={setCardType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yellow">Yellow Card</SelectItem>
                      <SelectItem value="red">Red Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {eventType === 'goal' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ownGoal"
                    checked={isOwnGoal}
                    onCheckedChange={setIsOwnGoal}
                  />
                  <Label htmlFor="ownGoal">Own Goal</Label>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional event details..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createEvent.isPending}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {createEvent.isPending ? 'Adding...' : 'Add Event'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ManualEventForm;