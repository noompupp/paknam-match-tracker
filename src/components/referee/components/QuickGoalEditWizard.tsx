
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Clock, User, Check } from "lucide-react";
import { ComponentPlayer } from "../hooks/useRefereeState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickGoal {
  id: number;
  event_time: number;
  team_id: string;
  description: string;
  created_at: string;
}

interface QuickGoalEditWizardProps {
  quickGoal: QuickGoal;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  formatTime: (seconds: number) => string;
  onGoalUpdated: (updatedGoal: any) => void;
  onCancel: () => void;
  homeTeamName?: string;
  awayTeamName?: string;
}

const QuickGoalEditWizard = ({
  quickGoal,
  homeTeamPlayers = [],
  awayTeamPlayers = [],
  formatTime,
  onGoalUpdated,
  onCancel,
  homeTeamName = 'Home Team',
  awayTeamName = 'Away Team'
}: QuickGoalEditWizardProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<ComponentPlayer | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Determine which team this goal belongs to and get the appropriate players
  const isHomeTeam = quickGoal.team_id.includes('home') || quickGoal.team_id === homeTeamName;
  const teamPlayers = isHomeTeam ? homeTeamPlayers : awayTeamPlayers;
  const teamName = isHomeTeam ? homeTeamName : awayTeamName;

  console.log('🎯 QuickGoalEditWizard: Editing quick goal:', {
    goalId: quickGoal.id,
    teamId: quickGoal.team_id,
    isHomeTeam,
    teamName,
    playersCount: teamPlayers.length
  });

  const handlePlayerSelect = (playerId: string) => {
    const player = teamPlayers.find(p => p.id.toString() === playerId);
    if (player) {
      setSelectedPlayer(player);
      console.log('👤 QuickGoalEditWizard: Player selected:', player);
    }
  };

  const handleUpdateGoal = async () => {
    if (!selectedPlayer) {
      toast({
        title: "No Player Selected",
        description: "Please select a player for this goal",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      console.log('🔄 QuickGoalEditWizard: Updating quick goal with player details:', {
        goalId: quickGoal.id,
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name
      });

      // Update the match event with the selected player's details
      const { data: updatedEvent, error } = await supabase
        .from('match_events')
        .update({
          player_name: selectedPlayer.name
        })
        .eq('id', quickGoal.id)
        .select()
        .single();

      if (error) {
        console.error('❌ QuickGoalEditWizard: Error updating goal:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update the goal with player details",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ QuickGoalEditWizard: Goal updated successfully:', updatedEvent);

      // Update player stats (goals) - handle missing goals property by defaulting to 0
      const { error: statsError } = await supabase
        .from('members')
        .update({
          goals: ((selectedPlayer as any).goals || 0) + 1
        })
        .eq('id', selectedPlayer.id);

      if (statsError) {
        console.error('❌ QuickGoalEditWizard: Error updating player stats:', statsError);
        // Don't fail the whole operation for stats update failure
      } else {
        console.log('✅ QuickGoalEditWizard: Player stats updated');
      }

      toast({
        title: "Goal Updated!",
        description: `Goal assigned to ${selectedPlayer.name}`,
      });

      onGoalUpdated({
        ...updatedEvent,
        player: selectedPlayer,
        team: teamName
      });

    } catch (error) {
      console.error('❌ QuickGoalEditWizard: Unexpected error:', error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Edit Quick Goal
          <Badge variant="outline" className="ml-auto">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(quickGoal.event_time)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Goal Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <div>
              <div className="font-medium">Quick Goal for {teamName}</div>
              <div className="text-sm text-muted-foreground">
                Scored at {formatTime(quickGoal.event_time)} • No player assigned
              </div>
            </div>
          </div>
        </div>

        {/* Player Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <label className="text-sm font-medium">Select Goal Scorer</label>
          </div>
          
          {teamPlayers.length > 0 ? (
            <Select onValueChange={handlePlayerSelect}>
              <SelectTrigger>
                <SelectValue placeholder={`Select player from ${teamName}`} />
              </SelectTrigger>
              <SelectContent>
                {teamPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{player.name}</span>
                      {player.number && (
                        <Badge variant="outline" className="text-xs">
                          #{player.number}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No players available for {teamName}</p>
            </div>
          )}
        </div>

        {/* Selected Player Preview */}
        {selectedPlayer && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  Goal will be assigned to {selectedPlayer.name}
                </div>
                <div className="text-sm text-green-700">
                  {teamName} • {formatTime(quickGoal.event_time)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleUpdateGoal}
            disabled={!selectedPlayer || isUpdating}
            className="flex-1"
          >
            {isUpdating ? 'Updating...' : 'Assign Goal'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickGoalEditWizard;
