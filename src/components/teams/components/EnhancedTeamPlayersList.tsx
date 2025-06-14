import { Users, AlertTriangle } from "lucide-react";
import { Member, Team } from "@/types/database";
import EnhancedPlayerStatsCard from "./EnhancedPlayerStatsCard";
import { cn } from "@/lib/utils";
import PlayerStatsLegend from "./PlayerStatsLegend";

interface EnhancedTeamPlayersListProps {
  players: Member[];
  teamData?: Team;
  className?: string;
}

const EnhancedTeamPlayersList = ({ players, teamData, className }: EnhancedTeamPlayersListProps) => {
  const getTopScorer = (squad: Member[]) => {
    return squad.reduce((top, player) => 
      (player.goals || 0) > (top?.goals || 0) ? player : top
    , squad[0]);
  };

  const getTopAssister = (squad: Member[]) => {
    return squad.reduce((top, player) => 
      (player.assists || 0) > (top?.assists || 0) ? player : top
    , squad[0]);
  };

  const topScorer = players.length > 0 ? getTopScorer(players) : null;
  const topAssister = players.length > 0 ? getTopAssister(players) : null;

  if (players.length === 0) {
    return (
      <div className={cn("text-center py-12 px-6", className)}>
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 opacity-50" />
        </div>
        <p className="font-medium text-lg mb-2 text-muted-foreground">No players found for this team</p>
        <p className="text-sm text-muted-foreground">Players will appear here once they're added to the squad</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg text-foreground">
          Squad ({players.length} players)
        </h3>
      </div>
      
      <div className="space-y-2">
        {players.map((player, index) => (
          <EnhancedPlayerStatsCard
            key={player.id || index}
            player={player}
            teamData={teamData}
            index={index}
            isTopScorer={topScorer?.id === player.id && (player.goals || 0) > 0}
            isTopAssister={topAssister?.id === player.id && (player.assists || 0) > 0}
          />
        ))}
      </div>
      {/* Stat Legend Displayed Below Player List */}
      <PlayerStatsLegend />
    </div>
  );
};

export default EnhancedTeamPlayersList;
