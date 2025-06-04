
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PlayerCard from "./PlayerCard";

interface PlayersListProps {
  players: any[] | undefined;
  isLoading: boolean;
}

const PlayersList = ({ players, isLoading }: PlayersListProps) => {
  // Hierarchical sorting function
  const sortMembersHierarchically = (membersList: any[]) => {
    const getRoleOrder = (role: string | null | undefined) => {
      switch (role?.toLowerCase()) {
        case 'captain': return 1;
        case 's-class': return 2;
        case 'starter': return 3;
        default: return 4;
      }
    };

    return membersList.sort((a, b) => {
      // First sort by role hierarchy
      const roleComparison = getRoleOrder(a.role) - getRoleOrder(b.role);
      if (roleComparison !== 0) return roleComparison;
      
      // Then by goals (descending)
      const goalsComparison = (b.goals || 0) - (a.goals || 0);
      if (goalsComparison !== 0) return goalsComparison;
      
      // Finally by name (ascending)
      return (a.name || '').localeCompare(b.name || '');
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Squad Members
        </h3>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Squad Members
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No players found for this team</p>
          <p className="text-sm">Players will appear here once they are added to the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Users className="h-5 w-5" />
        Squad Members
      </h3>
      <div className="space-y-4">
        {sortMembersHierarchically([...players]).map((player, index) => (
          <PlayerCard key={player.id} player={player} index={index} />
        ))}
      </div>
    </div>
  );
};

export default PlayersList;
