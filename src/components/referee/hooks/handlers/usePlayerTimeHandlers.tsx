
import { useToast } from "@/hooks/use-toast";
import { ComponentPlayer, PlayerTimeTrackerPlayer } from "../useRefereeState";
import { playerTimeTrackingService } from "@/services/fixtures/playerTimeTrackingService";

interface UsePlayerTimeHandlersProps {
  selectedFixtureData: any;
  matchTime: number;
  playersForTimeTracker: PlayerTimeTrackerPlayer[];
  addPlayer: (player: ComponentPlayer, matchTime: number) => any;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number, matchTime: number) => any;
  addEvent: (type: string, description: string, time: number) => void;
}

export const usePlayerTimeHandlers = (props: UsePlayerTimeHandlersProps) => {
  const { toast } = useToast();

  const handleAddPlayer = (player: ComponentPlayer) => {
    props.addPlayer(player, props.matchTime);
    props.addEvent('Player Added', `${player.name} started tracking`, props.matchTime);
  };

  const handleRemovePlayer = async (playerId: number) => {
    const player = props.playersForTimeTracker.find(p => p.id === playerId);
    if (player && props.selectedFixtureData) {
      // Save player time data to database before removing
      try {
        const teamId = player.team === props.selectedFixtureData.home_team?.name 
          ? props.selectedFixtureData.home_team_id 
          : props.selectedFixtureData.away_team_id;

        await playerTimeTrackingService.savePlayerTime({
          fixture_id: props.selectedFixtureData.id,
          player_id: playerId,
          player_name: player.name,
          team_id: teamId,
          total_minutes: player.totalTime,
          periods: [{
            start_time: player.startTime || 0,
            end_time: props.matchTime,
            duration: player.totalTime
          }]
        });

        console.log('✅ Player time data saved to database');
        toast({
          title: "Player Time Saved",
          description: `${player.name}'s playing time has been saved to the database`,
        });
      } catch (error) {
        console.error('❌ Failed to save player time data:', error);
        toast({
          title: "Warning",
          description: `Failed to save ${player.name}'s time data to database`,
          variant: "destructive"
        });
      }

      props.removePlayer(playerId);
      props.addEvent('Player Removed', `${player.name} stopped tracking`, props.matchTime);
    }
  };

  const handleTogglePlayerTime = (playerId: number) => {
    const player = props.playersForTimeTracker.find(p => p.id === playerId);
    if (player) {
      const result = props.togglePlayerTime(playerId, props.matchTime);
      const action = result ? 'started' : 'stopped';
      props.addEvent('Player Time', `${player.name} ${action} playing`, props.matchTime);
    }
  };

  const handleSaveAllPlayerTimes = async () => {
    if (!props.selectedFixtureData || props.playersForTimeTracker.length === 0) return;

    try {
      const savePromises = props.playersForTimeTracker.map(async (player) => {
        const teamId = player.team === props.selectedFixtureData.home_team?.name 
          ? props.selectedFixtureData.home_team_id 
          : props.selectedFixtureData.away_team_id;

        return playerTimeTrackingService.savePlayerTime({
          fixture_id: props.selectedFixtureData.id,
          player_id: player.id,
          player_name: player.name,
          team_id: teamId,
          total_minutes: Math.floor(player.totalTime / 60), // Convert to minutes
          periods: [{
            start_time: player.startTime || 0,
            end_time: props.matchTime,
            duration: Math.floor(player.totalTime / 60)
          }]
        });
      });

      await Promise.all(savePromises);
      
      toast({
        title: "Player Times Saved",
        description: `All ${props.playersForTimeTracker.length} player time records saved to database`,
      });
    } catch (error) {
      console.error('❌ Failed to save player time data:', error);
      toast({
        title: "Save Failed",
        description: "Some player time data could not be saved",
        variant: "destructive"
      });
    }
  };

  return {
    handleAddPlayer,
    handleRemovePlayer,
    handleTogglePlayerTime,
    handleSaveAllPlayerTimes
  };
};
