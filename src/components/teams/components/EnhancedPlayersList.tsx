
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnhancedPlayerStats } from "@/services/enhancedTeamStatsService";
import { usePlayerFiltering } from "@/hooks/useEnhancedTeamStats";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import ResponsivePlayerFilters, { type FilterOptions } from "./ResponsivePlayerFilters";
import MobileOptimizedPlayerCard from "./MobileOptimizedPlayerCard";
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
  const { isMobile, isPortrait } = useDeviceOrientation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
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
            <Skeleton key={i} className={
              isMobile && isPortrait ? "h-12 w-full" : 
              variant === 'compact' ? "h-16 w-full" : "h-20 w-full"
            } />
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
      {/* Responsive Filters */}
      <ResponsivePlayerFilters
        filters={filters}
        onFiltersChange={setFilters}
        playerCount={players.length}
        filteredCount={filteredAndSortedPlayers.length}
      />

      {/* View Mode Toggle (Desktop only) */}
      {!isMobile && (
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
      )}

      {/* Players List/Grid */}
      {filteredAndSortedPlayers.length > 0 ? (
        <div className={
          !isMobile && viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-3"
        }>
          {filteredAndSortedPlayers.map((player) => {
            // Use mobile-optimized card for mobile devices
            if (isMobile) {
              return (
                <MobileOptimizedPlayerCard
                  key={player.id}
                  player={{
                    id: player.id,
                    name: player.name,
                    nickname: player.nickname,
                    number: player.number,
                    position: player.position,
                    role: player.role,
                    ProfileURL: player.ProfileURL,
                    goals: player.goals,
                    assists: player.assists,
                    matches_played: player.matches_played,
                    total_minutes_played: player.total_minutes_played,
                    yellow_cards: player.yellow_cards,
                    red_cards: player.red_cards,
                    team_id: player.team.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }}
                  teamData={{
                    id: parseInt(player.team.id) || 0,
                    __id__: player.team.id,
                    name: player.team.name,
                    color: player.team.color,
                    logo: player.team.logo,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }}
                  index={filteredAndSortedPlayers.indexOf(player)}
                  variant={isPortrait ? 'compact' : 'default'}
                />
              );
            }

            // Use regular PlayerStatsRow for desktop
            return (
              <PlayerStatsRow
                key={player.id}
                player={player}
                variant={variant}
                showDetailedStats={showDetailedStats}
              />
            );
          })}
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
