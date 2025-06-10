
import { Users } from "lucide-react";
import { Member, Team } from "@/types/database";
import PlayerStatsCard from "./PlayerStatsCard";

interface TeamPlayersListProps {
  players: Member[];
  teamData?: Team;
}

const TeamPlayersList = ({ players, teamData }: TeamPlayersListProps) => {
  if (players.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 px-6">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 opacity-50" />
        </div>
        <p className="font-medium text-lg mb-2">No players found for this team</p>
        <p className="text-sm">Players will appear here once they're added to the squad</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {players.map((player, index) => (
        <PlayerStatsCard
          key={player.id || index}
          player={player}
          teamData={teamData}
          index={index}
        />
      ))}
    </div>
  );
};

export default TeamPlayersList;
