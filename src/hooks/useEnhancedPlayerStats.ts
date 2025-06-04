
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedPlayerStats {
  id: number;
  name: string;
  team_name: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  total_minutes_played: number;
  matches_played: number;
}

export const useEnhancedTopScorers = (limit: number = 5) => {
  return useQuery({
    queryKey: ['enhancedTopScorers', limit],
    queryFn: async () => {
      console.log('🎣 useEnhancedTopScorers: Starting enhanced query with limit:', limit);
      
      try {
        const { data, error } = await supabase
          .from('player_stats_view')
          .select('*')
          .gt('goals', 0)
          .order('goals', { ascending: false })
          .order('assists', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('❌ useEnhancedTopScorers: Query failed:', error);
          throw error;
        }

        console.log('✅ useEnhancedTopScorers: Query successful, scorers:', data);
        
        // Transform to match expected interface
        return (data || []).map(player => ({
          name: player.name || 'Unknown Player',
          team: player.team_name || 'Unknown Team',
          goals: player.goals || 0
        }));
      } catch (error) {
        console.error('❌ useEnhancedTopScorers: Critical error:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds - more frequent updates
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: (failureCount, error) => {
      console.log('🔄 useEnhancedTopScorers: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useEnhancedTopAssists = (limit: number = 5) => {
  return useQuery({
    queryKey: ['enhancedTopAssists', limit],
    queryFn: async () => {
      console.log('🎣 useEnhancedTopAssists: Starting enhanced query with limit:', limit);
      
      try {
        const { data, error } = await supabase
          .from('player_stats_view')
          .select('*')
          .gt('assists', 0)
          .order('assists', { ascending: false })
          .order('goals', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('❌ useEnhancedTopAssists: Query failed:', error);
          throw error;
        }

        console.log('✅ useEnhancedTopAssists: Query successful, assists:', data);
        
        // Transform to match expected interface
        return (data || []).map(player => ({
          name: player.name || 'Unknown Player',
          team: player.team_name || 'Unknown Team',
          assists: player.assists || 0
        }));
      } catch (error) {
        console.error('❌ useEnhancedTopAssists: Critical error:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds - more frequent updates
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: (failureCount, error) => {
      console.log('🔄 useEnhancedTopAssists: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 3;
    }
  });
};

export const useRealTimePlayerStats = () => {
  return useQuery({
    queryKey: ['realTimePlayerStats'],
    queryFn: async () => {
      console.log('🎣 useRealTimePlayerStats: Fetching comprehensive player stats...');
      
      try {
        const { data, error } = await supabase
          .from('player_stats_view')
          .select('*')
          .order('goals', { ascending: false });

        if (error) {
          console.error('❌ useRealTimePlayerStats: Query failed:', error);
          throw error;
        }

        console.log('✅ useRealTimePlayerStats: Query successful, players:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('❌ useRealTimePlayerStats: Critical error:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3
  });
};
