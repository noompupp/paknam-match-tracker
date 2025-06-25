
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LatestCompleteFixture {
  id: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: string;
  home_team?: {
    name: string;
    id: number; // This is actually a number from the database
    __id__: string;
  };
  away_team?: {
    name: string;
    id: number; // This is actually a number from the database
    __id__: string;
  };
  home_team_name?: string;
  away_team_name?: string;
  venue?: string;
  time?: string;
}

export const useLatestCompleteFixtures = () => {
  return useQuery<LatestCompleteFixture[]>({
    queryKey: ["latest_complete_fixtures"],
    queryFn: async (): Promise<LatestCompleteFixture[]> => {
      const { data: fixtures, error } = await supabase
        .from("fixtures")
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(name, id, __id__),
          away_team:teams!fixtures_away_team_id_fkey(name, id, __id__)
        `)
        .not("home_score", "is", null)
        .not("away_score", "is", null)
        .eq("status", "completed")
        .order("match_date", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching fixtures:", error);
        throw error;
      }

      return fixtures?.map(fixture => ({
        id: fixture.id,
        home_team_id: fixture.home_team_id,
        away_team_id: fixture.away_team_id,
        home_score: fixture.home_score,
        away_score: fixture.away_score,
        match_date: fixture.match_date,
        status: fixture.status,
        home_team: fixture.home_team,
        away_team: fixture.away_team,
        venue: fixture.venue,
        time: fixture.time
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
