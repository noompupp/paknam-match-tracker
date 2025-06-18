
import SimplePlayerTimeTracker from "./components/playerTimeTracker/SimplePlayerTimeTracker";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface PlayerTimeTrackerProps {
  trackedPlayers: PlayerTime[];
  selectedPlayer: string;
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  selectedTimeTeam: string;
  onPlayerSelect: (value: string) => void;
  onTimeTeamChange: (value: string) => void;
  onAddPlayer: () => void;
  onTogglePlayerTime: (playerId: number) => void;
  formatTime: (seconds: number) => string;
  matchTime?: number;
  selectedFixtureData?: any;
}

const PlayerTimeTracker = (props: PlayerTimeTrackerProps) => {
  console.log('⏱️ PlayerTimeTracker Main Component:', {
    trackedCount: props.trackedPlayers.length,
    selectedPlayer: props.selectedPlayer,
    selectedTimeTeam: props.selectedTimeTeam
  });

  return <SimplePlayerTimeTracker {...props} />;
};

export default PlayerTimeTracker;
