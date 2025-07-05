import { useState } from "react";
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

  const teamPlayers = allPlayers.filter(p => p.team_id === teamId);

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
                <Select value={teamId} onValueChange={setTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={homeTeamId}>Home Team</SelectItem>
                    <SelectItem value={awayTeamId}>Away Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player">Player *</Label>
                {teamPlayers.length > 0 ? (
                  <Select value={playerName} onValueChange={setPlayerName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.name}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter player name"
                  />
                )}
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