
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
    id: string;
    __id__: string;
  };
  away_team?: {
    name: string;
    id: string;
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
    queryFn: async () => {
      // Mock data for latest complete fixtures
      const mockFixtures: LatestCompleteFixture[] = [
        {
          id: 1,
          home_team_id: "team1",
          away_team_id: "team2",
          home_score: 2,
          away_score: 1,
          match_date: new Date().toISOString().split('T')[0],
          status: "completed",
          home_team: {
            name: "Team Alpha",
            id: "team1",
            __id__: "team1"
          },
          away_team: {
            name: "Team Beta", 
            id: "team2",
            __id__: "team2"
          },
          venue: "Main Stadium",
          time: "18:00"
        }
      ];

      return mockFixtures;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
