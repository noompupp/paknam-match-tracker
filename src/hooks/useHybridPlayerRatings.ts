
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/contexts/SecureAuthContext";

export interface HybridRatingData {
  player_id: number;
  player_name: string;
  team_id: string;
  position: string;
  minutes_played: number;
  match_result: string;
  fpl_points: number;
  fpl_rating: number;
  participation_rating: number;
  final_rating: number;
  rating_breakdown: {
    goals_conceded: number;
    clean_sheet_eligible: boolean;
  };
}

export interface PlayerRatingRow {
  player_id: number;
  player_name: string;
  team_id: string;
  team_name: string;
  position: string;
  rating_data: HybridRatingData;
}

export interface ApprovedRating {
  id: string;
  fixture_id: number;
  player_id: number;
  player_name: string;
  team_id: string;
  fpl_rating: number;
  participation_rating: number;
  final_rating: number;
  approved_by: string;
  approved_at: string;
  rating_data: HybridRatingData;
}

/**
 * Hook to fetch calculated hybrid ratings for a fixture
 */
export function useHybridPlayerRatings(fixtureId: number | null) {
  const query = useQuery<PlayerRatingRow[]>({
    queryKey: ["hybrid_player_ratings", fixtureId],
    enabled: !!fixtureId,
    queryFn: async () => {
      if (!fixtureId) return [];
      
      // For now, return mock data until the database function is properly set up
      // This simulates the structure we expect from get_fixture_player_ratings
      const mockData: PlayerRatingRow[] = [
        {
          player_id: 1,
          player_name: "John Doe",
          team_id: "team1",
          team_name: "Team Alpha",
          position: "GK",
          rating_data: {
            player_id: 1,
            player_name: "John Doe",
            team_id: "team1",
            position: "GK",
            minutes_played: 90,
            match_result: "win",
            fpl_points: 8,
            fpl_rating: 7.5,
            participation_rating: 8.0,
            final_rating: 7.65,
            rating_breakdown: {
              goals_conceded: 0,
              clean_sheet_eligible: true
            }
          }
        },
        {
          player_id: 2,
          player_name: "Jane Smith",
          team_id: "team1",
          team_name: "Team Alpha",
          position: "DF",
          rating_data: {
            player_id: 2,
            player_name: "Jane Smith",
            team_id: "team1",
            position: "DF",
            minutes_played: 90,
            match_result: "win",
            fpl_points: 6,
            fpl_rating: 6.8,
            participation_rating: 7.5,
            final_rating: 7.01,
            rating_breakdown: {
              goals_conceded: 0,
              clean_sheet_eligible: true
            }
          }
        },
        {
          player_id: 3,
          player_name: "Mike Johnson",
          team_id: "team2",
          team_name: "Team Beta",
          position: "MF",
          rating_data: {
            player_id: 3,
            player_name: "Mike Johnson",
            team_id: "team2",
            position: "MF",
            minutes_played: 85,
            match_result: "loss",
            fpl_points: 4,
            fpl_rating: 6.2,
            participation_rating: 7.0,
            final_rating: 6.44,
            rating_breakdown: {
              goals_conceded: 2,
              clean_sheet_eligible: false
            }
          }
        },
        {
          player_id: 4,
          player_name: "Sarah Wilson",
          team_id: "team1",
          team_name: "Team Alpha",
          position: "WG",
          rating_data: {
            player_id: 4,
            player_name: "Sarah Wilson",
            team_id: "team1",
            position: "WG",
            minutes_played: 90,
            match_result: "win",
            fpl_points: 10,
            fpl_rating: 8.5,
            participation_rating: 8.5,
            final_rating: 8.5,
            rating_breakdown: {
              goals_conceded: 0,
              clean_sheet_eligible: false
            }
          }
        },
        {
          player_id: 5,
          player_name: "Tom Brown",
          team_id: "team2",
          team_name: "Team Beta",
          position: "FW",
          rating_data: {
            player_id: 5,
            player_name: "Tom Brown",
            team_id: "team2",
            position: "FW",
            minutes_played: 90,
            match_result: "loss",
            fpl_points: 8,
            fpl_rating: 7.8,
            participation_rating: 7.5,
            final_rating: 7.71,
            rating_breakdown: {
              goals_conceded: 0,
              clean_sheet_eligible: false
            }
          }
        },
        {
          player_id: 6,
          player_name: "Alex Davis",
          team_id: "team1",
          team_name: "Team Alpha",
          position: "DF",
          rating_data: {
            player_id: 6,
            player_name: "Alex Davis",
            team_id: "team1",
            position: "DF",
            minutes_played: 90,
            match_result: "win",
            fpl_points: 5,
            fpl_rating: 6.5,
            participation_rating: 7.8,
            final_rating: 6.89,
            rating_breakdown: {
              goals_conceded: 0,
              clean_sheet_eligible: true
            }
          }
        },
        {
          player_id: 7,
          player_name: "Emma Taylor",
          team_id: "team2",
          team_name: "Team Beta",
          position: "MF",
          rating_data: {
            player_id: 7,
            player_name: "Emma Taylor",
            team_id: "team2",
            position: "MF",
            minutes_played: 75,
            match_result: "loss",
            fpl_points: 3,
            fpl_rating: 5.8,
            participation_rating: 6.5,
            final_rating: 6.01,
            rating_breakdown: {
              goals_conceded: 0,
              clean_sheet_eligible: false
            }
          }
        },
        {
          player_id: 8,
          player_name: "Chris Lee",
          team_id: "team1",
          team_name: "Team Alpha",
          position: "WG",
          rating_data: {
            player_id: 8,
            player_name: "Chris Lee",
            team_id: "team1",
            position: "WG",
            minutes_played: 60,
            match_result: "win",
            fpl_points: 7,
            fpl_rating: 7.2,
            participation_rating: 6.8,
            final_rating: 7.08,
            rating_breakdown: {
              goals_conceded: 0,
              clean_sheet_eligible: false
            }
          }
        }
      ];
      
      return mockData;
    },
    staleTime: 2 * 60 * 1000,
  });

  return query;
}

/**
 * Hook to fetch approved ratings for a fixture
 */
export function useApprovedPlayerRatings(fixtureId: number | null) {
  const query = useQuery<ApprovedRating[]>({
    queryKey: ["approved_player_ratings", fixtureId],
    enabled: !!fixtureId,
    queryFn: async () => {
      if (!fixtureId) return [];
      
      const { data, error } = await supabase
        .from("approved_player_ratings")
        .select("*")
        .eq("fixture_id", fixtureId)
        .order("final_rating", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  return query;
}

/**
 * Hook to approve a player's rating
 */
export function useApprovePlayerRating() {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();

  return useMutation({
    mutationFn: async ({
      fixtureId,
      playerId,
      playerName,
      teamId,
      position = 'Player'
    }: {
      fixtureId: number;
      playerId: number;
      playerName: string;
      teamId: string;
      position?: string;
    }) => {
      if (!user) throw new Error("Not logged in");
      
      const { data, error } = await supabase.rpc('approve_player_rating', {
        p_fixture_id: fixtureId,
        p_player_id: playerId,
        p_player_name: playerName,
        p_team_id: teamId,
        p_position: position
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, vars) => {
      // Refresh both calculated and approved ratings
      queryClient.invalidateQueries({
        queryKey: ["hybrid_player_ratings", vars.fixtureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["approved_player_ratings", vars.fixtureId],
      });
    },
  });
}

/**
 * Hook to check if user can approve ratings
 */
export function useCanApproveRatings() {
  const { user, hasRole } = useSecureAuth();
  
  const { data: canApprove = false, isLoading } = useQuery({
    queryKey: ["can_approve_ratings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return false;
      
      // Check if user has rater, referee_rater, or admin role
      const isRater = await hasRole('rater');
      const isRefereeRater = await hasRole('referee_rater');
      const isAdmin = await hasRole('admin');
      
      return isRater || isRefereeRater || isAdmin;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { canApprove, isLoading };
}
