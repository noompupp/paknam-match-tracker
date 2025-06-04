
import { useToast } from "@/hooks/use-toast";
import { PlayerTimeTrackerPlayer } from "../useRefereeState";

interface UseExportHandlersProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  goals: any[];
  playersForTimeTracker: PlayerTimeTrackerPlayer[];
}

export const useExportHandlers = (props: UseExportHandlersProps) => {
  const { toast } = useToast();

  const handleExportSummary = () => {
    // Enhanced export functionality with time in minutes
    const summaryData = {
      fixture: props.selectedFixtureData,
      score: `${props.homeScore}-${props.awayScore}`,
      duration: `${Math.floor(props.matchTime / 60)} minutes`,
      match_info: {
        home_team: props.selectedFixtureData?.home_team?.name,
        away_team: props.selectedFixtureData?.away_team?.name,
        home_score: props.homeScore,
        away_score: props.awayScore,
        match_date: props.selectedFixtureData?.match_date,
        venue: props.selectedFixtureData?.venue
      },
      events: props.goals,
      goals_and_assists: props.goals.map(goal => ({
        player: goal.playerName,
        team: goal.team,
        type: goal.type,
        time: `${Math.floor(goal.time / 60)} min`
      })),
      player_times: props.playersForTimeTracker.map(player => ({
        name: player.name,
        team: player.team,
        total_time: `${Math.floor(player.totalTime / 60)} minutes`,
        is_playing: player.isPlaying
      })),
      statistics: {
        total_events: props.goals.length,
        total_goals: props.goals.filter(g => g.type === 'goal').length,
        total_assists: props.goals.filter(g => g.type === 'assist').length,
        players_tracked: props.playersForTimeTracker.length,
        match_duration: `${Math.floor(props.matchTime / 60)} minutes`
      },
      export_timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(summaryData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `enhanced-match-summary-${props.selectedFixtureData?.home_team?.name}-vs-${props.selectedFixtureData?.away_team?.name}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Enhanced Match Summary Exported",
      description: "Complete match data with statistics has been downloaded as JSON file.",
    });
  };

  return {
    handleExportSummary
  };
};
