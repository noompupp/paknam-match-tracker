
import { Skeleton } from "@/components/ui/skeleton";
import { User, AlertTriangle } from "lucide-react";
import EnhancedTeamPlayersList from "./components/EnhancedTeamPlayersList";

interface PlayersListProps {
  players: any[] | undefined;
  isLoading: boolean;
}

const PlayersList = ({ players, isLoading }: PlayersListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 opacity-50" />
        </div>
        <p className="font-medium text-lg mb-2 text-muted-foreground">No players found for this team</p>
        <p className="text-sm text-muted-foreground">Players will appear here once they're added to the squad</p>
      </div>
    );
  }

  return <EnhancedTeamPlayersList players={players} />;
};

export default PlayersList;
