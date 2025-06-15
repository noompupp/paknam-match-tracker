
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFixtures = () => {
  return useQuery({
    queryKey: ["fixtures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(name, logo, __id__),
          away_team:teams!fixtures_away_team_id_fkey(name, logo, __id__)
        `)
        .order("match_date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useRecentFixtures = () => {
  return useQuery({
    queryKey: ["recent-fixtures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(name, logo, __id__),
          away_team:teams!fixtures_away_team_id_fkey(name, logo, __id__)
        `)
        .in("status", ["completed", "finished"])
        .order("match_date", { ascending: false })
        .order("time", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useUpcomingFixtures = () => {
  return useQuery({
    queryKey: ["upcoming-fixtures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(name, logo, __id__),
          away_team:teams!fixtures_away_team_id_fkey(name, logo, __id__)
        `)
        .in("status", ["scheduled", "pending"])
        .order("match_date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useUpdateFixtureScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      fixtureId, 
      homeScore, 
      awayScore 
    }: { 
      fixtureId: number; 
      homeScore: number; 
      awayScore: number; 
    }) => {
      const { data, error } = await supabase
        .from("fixtures")
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: "completed"
        })
        .eq("id", fixtureId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["recent-fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-fixtures"] });
    },
  });
};
