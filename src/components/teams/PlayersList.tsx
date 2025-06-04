
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Star, Users } from "lucide-react";

interface Player {
  id: number;
  name: string;
  position: string;
  number: string;
  goals: number;
  assists: number;
  role?: string;
}

interface PlayersListProps {
  players: Player[] | undefined;
  isLoading: boolean;
}

const PlayersList = ({ players, isLoading }: PlayersListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No players found for this team</p>
      </div>
    );
  }

  // Enhanced sorting: Captain → S-class → Starter → Others
  const sortedPlayers = [...players].sort((a, b) => {
    // Captain first
    if (a.role === 'Captain' && b.role !== 'Captain') return -1;
    if (b.role === 'Captain' && a.role !== 'Captain') return 1;
    
    // S-class second
    if (a.role === 'S-class' && b.role !== 'S-class' && b.role !== 'Captain') return -1;
    if (b.role === 'S-class' && a.role !== 'S-class' && a.role !== 'Captain') return 1;
    
    // Starter third
    if (a.role === 'Starter' && !['Captain', 'S-class'].includes(b.role || '')) return -1;
    if (b.role === 'Starter' && !['Captain', 'S-class'].includes(a.role || '')) return 1;
    
    // Then by name
    return a.name.localeCompare(b.name);
  });

  const getRoleIcon = (role: string | undefined) => {
    switch (role) {
      case 'Captain':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'S-class':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: string | undefined) => {
    switch (role) {
      case 'Captain':
        return 'default';
      case 'S-class':
        return 'secondary';
      case 'Starter':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Squad ({sortedPlayers.length} players)</h3>
      {sortedPlayers.map((player) => (
        <Card key={player.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                  {player.number || '#'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{player.name}</h4>
                    {getRoleIcon(player.role)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{player.position}</span>
                    {player.role && (
                      <Badge 
                        variant={getRoleBadgeVariant(player.role)} 
                        className="text-xs"
                      >
                        {player.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-semibold">{player.goals || 0}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">{player.assists || 0}</div>
                  <div className="text-xs text-muted-foreground">Assists</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlayersList;
