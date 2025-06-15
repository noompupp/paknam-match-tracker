
import { useQuery } from "@tanstack/react-query";
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
