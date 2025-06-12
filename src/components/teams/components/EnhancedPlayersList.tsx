
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";
import { usePlayerFiltering } from "@/hooks/useEnhancedTeamStats";
import PlayerFilters, { type FilterOptions } from "./PlayerFilters";
import PlayerStatsRow from "./PlayerStatsRow";

interface EnhancedPlayersListProps {
  players: EnhancedPlayerStats[] | null;
  isLoading: boolean;
  showDetailedStats?: boolean;
  variant?: 'default' | 'compact';
}

const EnhancedPlayersList = ({ 
  players, 
  isLoading, 
  showDetailedStats = false,
  variant = 'default'
}: EnhancedPlayersListProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    position: 'all',
    role: 'all',
    sortBy: 'contributionScore',
    sortOrder: 'desc'
  });

  const { filterByPosition, filterByRole, sortByMetric } = usePlayerFiltering(players || []);

  const filteredAndSortedPlayers = useMemo(() => {
    if (!players) return [];

    let filtered = players;

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        player.nickname?.toLowerCase().includes(filters.search.toLowerCase()) ||
        player.number.includes(filters.search)
      );
    }

    // Apply position filter
    if (filters.position !== 'all') {
      filtered = filterByPosition(filters.position);
    }

    // Apply role filter
    if (filters.role !== 'all') {
      filtered = filterByRole(filters.role);
    }

    // Apply sorting
    return sortByMetric(filters.sortBy as keyof EnhancedPlayerStats, filters.sortOrder === 'asc');
  }, [players, filters, filterByPosition, filterByRole, sortByMetric]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={variant === 'compact' ? "h-16 w-full" : "h-20 w-full"} />
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
        <p className="font-medium text-lg mb-2 text-muted-foreground">No players found</p>
        <p className="text-sm text-muted-foreground">Enhanced player data will appear here once available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <PlayerFilters
        filters={filters}
        onFiltersChange={setFilters}
        playerCount={players.length}
        filteredCount={filteredAndSortedPlayers.length}
      />

      {/* Players List */}
      {filteredAndSortedPlayers.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedPlayers.map((player) => (
            <PlayerStatsRow
              key={player.id}
              player={player}
              variant={variant}
              showDetailedStats={showDetailedStats}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-6">
          <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 opacity-50" />
          </div>
          <p className="font-medium mb-1">No players match your filters</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedPlayersList;
