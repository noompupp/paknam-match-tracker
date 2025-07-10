import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WeeklyTOTW {
  id: string;
  week_start_date: string;
  week_end_date: string;
  season_year: number;
  fixtures_included: number[];
  team_of_the_week: any[];
  captain_of_the_week: any | null;
  selection_method: 'automatic' | 'manual' | 'hybrid';
  is_finalized: boolean;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyPlayerPerformance {
  id: string;
  weekly_totw_id: string;
  player_id: number;
  player_name: string;
  team_id: string;
  team_name: string;
  position: string;
  total_minutes: number;
  matches_played: number;
  total_goals: number;
  total_assists: number;
  total_cards: number;
  average_fpl_rating: number;
  average_participation_rating: number;
  weighted_final_rating: number;
  fixtures_played_in: number[];
  performance_breakdown: any;
}

// Get current week's TOTW
export const useCurrentWeeklyTOTW = () => {
  return useQuery({
    queryKey: ['weekly-totw', 'current'],
    queryFn: async () => {
      const { data: weekBoundaries } = await supabase.rpc('get_current_week_boundaries');
      
      if (!weekBoundaries || weekBoundaries.length === 0) {
        throw new Error('Failed to get week boundaries');
      }

      const { week_start } = weekBoundaries[0];
      const season_year = new Date(week_start).getFullYear();

      const { data, error } = await supabase
        .from('weekly_totw')
        .select('*')
        .eq('week_start_date', week_start)
        .eq('season_year', season_year)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as WeeklyTOTW | null;
    },
  });
};

// Get weekly player performance
export const useWeeklyPlayerPerformance = (weeklyTotwId?: string) => {
  return useQuery({
    queryKey: ['weekly-player-performance', weeklyTotwId],
    queryFn: async () => {
      if (!weeklyTotwId) return [];

      const { data, error } = await supabase
        .from('weekly_player_performance')
        .select('*')
        .eq('weekly_totw_id', weeklyTotwId)
        .order('weighted_final_rating', { ascending: false });

      if (error) throw error;
      return data as WeeklyPlayerPerformance[];
    },
    enabled: !!weeklyTotwId,
  });
};

// Generate weekly TOTW
export const useGenerateWeeklyTOTW = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { week_start?: string; week_end?: string }) => {
      const { data, error } = await supabase.rpc('generate_weekly_totw', {
        p_week_start: params?.week_start || null,
        p_week_end: params?.week_end || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-totw'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-player-performance'] });
    },
  });
};

// Update weekly TOTW (for manual selections)
export const useUpdateWeeklyTOTW = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id?: string;
      team_of_the_week?: any[];
      captain_of_the_week?: any;
      selection_method?: string;
      is_finalized?: boolean;
    }) => {
      // If no ID provided, get current week boundaries and create/update
      if (!params.id) {
        const { data: weekBoundaries } = await supabase.rpc('get_current_week_boundaries');
        
        if (!weekBoundaries || weekBoundaries.length === 0) {
          throw new Error('Failed to get week boundaries');
        }

        const { week_start, week_end } = weekBoundaries[0];
        const season_year = new Date(week_start).getFullYear();

        // Try to upsert the weekly TOTW record
        const { data, error } = await supabase
          .from('weekly_totw')
          .upsert({
            week_start_date: week_start,
            week_end_date: week_end,
            season_year: season_year,
            team_of_the_week: params.team_of_the_week || [],
            captain_of_the_week: params.captain_of_the_week,
            selection_method: params.selection_method || 'manual',
            is_finalized: params.is_finalized || false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'week_start_date,season_year'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Update existing record
      const { data, error } = await supabase
        .from('weekly_totw')
        .update({
          team_of_the_week: params.team_of_the_week,
          captain_of_the_week: params.captain_of_the_week,
          selection_method: params.selection_method,
          is_finalized: params.is_finalized,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-totw'] });
    },
  });
};

// Get all weekly TOTW records (for history)
export const useWeeklyTOTWHistory = (seasonYear?: number) => {
  return useQuery({
    queryKey: ['weekly-totw', 'history', seasonYear],
    queryFn: async () => {
      let query = supabase
        .from('weekly_totw')
        .select('*')
        .order('week_start_date', { ascending: false });

      if (seasonYear) {
        query = query.eq('season_year', seasonYear);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WeeklyTOTW[];
    },
  });
};

// Aggregate weekly performance
export const useAggregateWeeklyPerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { week_start: string; week_end: string }) => {
      const { data, error } = await supabase.rpc('aggregate_weekly_player_performance', {
        p_week_start: params.week_start,
        p_week_end: params.week_end,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-player-performance'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-totw'] });
    },
  });
};