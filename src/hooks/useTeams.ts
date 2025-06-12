
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '@/services/api';
import { leagueTableService } from '@/services/leagueTableService';
import { Team } from '@/types/database';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      console.log('🎣 useTeams: Starting query with deduplicated league table...');
      try {
        // Use the deduplicated league table service to get accurate team data
        const deduplicatedTable = await leagueTableService.getDeduplicatedLeagueTable();
        
        // Convert league table entries back to Team format
        const teams: Team[] = deduplicatedTable.map(entry => ({
          id: entry.id,
          __id__: entry.id.toString(), // Convert to string for consistency
          name: entry.name,
          played: entry.played,
          won: entry.won,
          drawn: entry.drawn,
          lost: entry.lost,
          goals_for: entry.goals_for,
          goals_against: entry.goals_against,
          goal_difference: entry.goal_difference,
          points: entry.points,
          position: entry.position,
          previous_position: entry.previous_position,
          // Default values for other fields
          captain: null,
          color: null,
          logo: '⚽',
          logoURL: null,
          founded: '2020',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        console.log('🎣 useTeams: Query successful with deduplicated data, teams:', teams);
        return teams;
      } catch (error) {
        console.error('🎣 useTeams: Query failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log('🎣 useTeams: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useTeam = (id: number) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: async () => {
      console.log('🎣 useTeam: Starting query for ID:', id);
      try {
        const team = await teamsApi.getById(id);
        console.log('🎣 useTeam: Query successful, team:', team);
        return team;
      } catch (error) {
        console.error('🎣 useTeam: Query failed:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useUpdateTeamStats = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stats }: { id: number; stats: Partial<Team> }) =>
      teamsApi.updateStats(id, stats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};
