import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Clock, Save, X } from "lucide-react";
import { useUpdateMatchEvent } from "@/hooks/useMatchEvents";
import { useToast } from "@/hooks/use-toast";
import { useTeams } from "@/hooks/useTeams";
import { MatchEvent } from "@/types/database";

interface EditEventModalProps {
  event: MatchEvent | null;
  isOpen: boolean;
  onClose: () => void;
  formatTime: (seconds: number) => string;
  homeTeamId: string;
  awayTeamId: string;
  allPlayers: any[];
}

const EditEventModal = ({
  event,
  isOpen,
  onClose,
  formatTime,
  homeTeamId,
  awayTeamId,
  allPlayers
}: EditEventModalProps) => {
  const [eventType, setEventType] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [eventTime, setEventTime] = useState(0);
  const [description, setDescription] = useState("");
  const [cardType, setCardType] = useState("");
  const [isOwnGoal, setIsOwnGoal] = useState(false);

  const updateEvent = useUpdateMatchEvent();
  const { toast } = useToast();
  const { data: teams } = useTeams();

  // Enhanced helper function to get team name by ID with comprehensive debugging
  const getTeamName = (teamId: string) => {
    console.log('🏷️ EditEventModal - getTeamName called:', {
      teamId,
      teamIdType: typeof teamId,
      teamsAvailable: !!teams,
      teamsCount: teams?.length || 0
    });
    
    if (!teams || !teamId) {
      console.log('🏷️ EditEventModal - No teams or teamId, returning fallback');
      return `Team ${teamId}`;
    }
    
    // CRITICAL FIX: Handle numeric fixture team ID to text-based team __id__ mapping
    const team = teams.find(t => {
      // First try direct __id__ match
      if (t.__id__ === teamId) return true;
      
      // CRITICAL: Handle numeric fixture team IDs by matching with team.id
      if (t.id?.toString() === teamId) return true;
      
      // Fallback to name match
      if (t.name === teamId) return true;
      
      return false;
    });
    
    const result = team?.name || `Team ${teamId}`;
    console.log('🏷️ EditEventModal - getTeamName result:', {
      foundTeam: !!team,
      teamName: team?.name,
      teamId,
      result
    });
    
    return result;
  };

  // CRITICAL FIX: Get the text-based team __id__ for database operations
  const getTeamIdForDatabase = (fixtureTeamId: string) => {
    if (!teams || !fixtureTeamId) return fixtureTeamId;
    
    const team = teams.find(t => {
      // Match numeric fixture team ID with team.id
      if (t.id?.toString() === fixtureTeamId) return true;
      // Direct __id__ match
      if (t.__id__ === fixtureTeamId) return true;
      return false;
    });
    
    const result = team?.__id__ || fixtureTeamId;
    console.log('🏷️ EditEventModal - getTeamIdForDatabase:', {
      fixtureTeamId,
      foundTeam: !!team,
      teamName: team?.name,
      resultId: result
    });
    
    return result;
  };

  // CRITICAL FIX: Enhanced player filtering with proper team ID mapping
  const availablePlayers = useMemo(() => {
    if (!teamId || !allPlayers || !teams) return [];
    
    console.log('🔍 EditEventModal - Filtering players (ENHANCED):', {
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
      console.error('🔍 EditEventModal - Selected team not found!:', {
        teamId,
        availableTeams: teams.map(t => ({ id: t.id, __id__: t.__id__, name: t.name }))
      });
      return [];
    }
    
    const targetTeamId = selectedTeam.__id__; // Use the __id__ for player matching
    console.log('🔍 EditEventModal - Using target team ID for filtering:', {
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
        console.log('🔍 EditEventModal - Player match check (ENHANCED):', {
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
    
    console.log('🔍 EditEventModal - Enhanced filtered result:', {
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

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setEventType(event.event_type);
      setPlayerName(event.player_name);
      setTeamId(event.team_id);
      setEventTime(event.event_time);
      setDescription(event.description || "");
      setCardType(event.card_type || "");
      setIsOwnGoal(event.is_own_goal || false);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event || !eventType || !playerName || !teamId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // CRITICAL FIX: Convert fixture team IDs to database-compatible team IDs
      const databaseTeamId = getTeamIdForDatabase(teamId);
      const databaseHomeTeamId = getTeamIdForDatabase(homeTeamId);
      const databaseAwayTeamId = getTeamIdForDatabase(awayTeamId);
      
      console.log('🎯 EditEventModal - Updating event with mapped team IDs:', {
        originalTeamId: teamId,
        databaseTeamId,
        originalHomeTeamId: homeTeamId,
        databaseHomeTeamId,
        originalAwayTeamId: awayTeamId,
        databaseAwayTeamId
      });

      const updates: Partial<MatchEvent> = {
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

      await updateEvent.mutateAsync({ 
        eventId: event.id, 
        updates 
      });

      toast({
        title: "Event Updated",
        description: "Event updated successfully",
      });

      onClose();
    } catch (error) {
      console.error('Failed to update event:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setEventType("");
    setPlayerName("");
    setTeamId("");
    setEventTime(0);
    setDescription("");
    setCardType("");
    setIsOwnGoal(false);
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                        key={`edit-player-${player.id}-${player.name}`} 
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

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={updateEvent.isPending}
              className="flex items-center gap-2 flex-1"
            >
              <Save className="h-4 w-4" />
              {updateEvent.isPending ? 'Updating...' : 'Update Event'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>    
  );
};

export default EditEventModal;