
import { Member, Team } from "@/types/database";
import EnhancedPlayerStatsCard from "./EnhancedPlayerStatsCard";

interface PlayerStatsCardProps {
  player: Member;
  teamData?: Team;
  index: number;
}

const PlayerStatsCard = ({ player, teamData, index }: PlayerStatsCardProps) => {
  return (
    <EnhancedPlayerStatsCard 
      player={player}
      teamData={teamData}
      index={index}
    />
  );
};

export default PlayerStatsCard;
