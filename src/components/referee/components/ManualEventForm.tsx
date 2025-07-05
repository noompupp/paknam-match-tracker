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

  // Enhanced helper function to get team name by ID with comprehensive debugging
  const getTeamName = (teamId: string) => {
    console.log('🏷️ ManualEventForm - getTeamName called:', {
      teamId,
      teamsAvailable: !!teams,
      teamsCount: teams?.length || 0,
      sampleTeam: teams?.[0]
    });
    
    if (!teams || !teamId) {
      console.log('🏷️ ManualEventForm - No teams or teamId, returning fallback');
      return `Team ${teamId}`;
    }
    
    // Try multiple matching strategies with detailed logging
    const team = teams.find(t => {
      const matches = [
        t.__id__ === teamId,
        t.id?.toString() === teamId,
        t.__id__ === teamId.toString(),
        t.name === teamId // Sometimes teamId might actually be the name
      ];
      
      console.log('🏷️ ManualEventForm - Team matching attempt:', {
        teamName: t.name,
        team__id__: t.__id__,
        teamId_numeric: t.id,
        searchingFor: teamId,
        matches: {
          __id__exact: matches[0],
          id_toString: matches[1],
          __id__toString: matches[2],
          name_match: matches[3]
        },
        anyMatch: matches.some(Boolean)
      });
      
      return matches.some(Boolean);
    });
    
    const result = team?.name || `Team ${teamId}`;
    console.log('🏷️ ManualEventForm - getTeamName result:', {
      foundTeam: !!team,
      teamName: team?.name,
      result
    });
    
    return result;
  };

  // Enhanced player filtering with better team ID matching and comprehensive debugging
  const availablePlayers = useMemo(() => {
    if (!teamId || !allPlayers) return [];
    
    console.log('🔍 ManualEventForm - Filtering players:', {
      selectedTeamId: teamId,
      totalPlayers: allPlayers.length,
      samplePlayer: allPlayers[0],
      allPlayerTeamIds: allPlayers.slice(0, 5).map(p => ({
        name: p.name,
        team_id: p.team_id,
        team_id_type: typeof p.team_id
      }))
    });
    
    const filtered = allPlayers.filter(player => {
      // Multiple matching strategies for team_id with more comprehensive comparison
      const playerTeamId = player.team_id?.toString();
      const selectedTeamIdStr = teamId.toString();
      
      const matches = [
        playerTeamId === selectedTeamIdStr,
        playerTeamId === teamId,
        player.team_id === teamId,
        player.team_id?.toString() === selectedTeamIdStr,
        // Additional fallback - sometimes team_id might be stored differently
        String(player.team_id) === String(teamId)
      ];
      
      const isMatch = matches.some(Boolean);
      
      if (allPlayers.indexOf(player) < 3) { // Debug first few players
        console.log('🔍 ManualEventForm - Player match check:', {
          playerName: player.name,
          playerTeamId: player.team_id,
          playerTeamIdString: playerTeamId,
          selectedTeamId: teamId,
          selectedTeamIdString: selectedTeamIdStr,
          matches: {
            toString_exact: matches[0],
            direct_string: matches[1], 
            direct_exact: matches[2],
            toString_comparison: matches[3],
            string_cast: matches[4]
          },
          finalMatch: isMatch
        });
      }
      
      return isMatch;
    });
    
    console.log('🔍 ManualEventForm - Filtered result:', {
      matchingPlayers: filtered.length,
      players: filtered.map(p => ({ name: p.name, team_id: p.team_id }))
    });
    
    return filtered;
  }, [teamId, allPlayers]);

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
      const eventData: Omit<MatchEvent, 'id' | 'created_at'> = {
        fixture_id: fixtureId,
        event_type: eventType as any,
        player_name: playerName,
        team_id: teamId,
        event_time: eventTime,
        description: description || `${eventType} by ${playerName}`,
        card_type: eventType.includes('card') ? (cardType as 'yellow' | 'red') : null,
        is_own_goal: eventType === 'goal' ? isOwnGoal : false,
        scoring_team_id: eventType === 'goal' && isOwnGoal 
          ? (teamId === homeTeamId ? awayTeamId : homeTeamId)
          : teamId,
        affected_team_id: teamId
      };

      await createEvent.mutateAsync(eventData);

      toast({
        title: "Event Added",
        description: `${eventType} event added successfully`,
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
      console.error('Failed to create event:', error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
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
  );
};

export default ManualEventForm;