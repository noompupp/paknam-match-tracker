
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
      
      const { data, error } = await supabase.rpc('get_fixture_player_ratings', {
        p_fixture_id: fixtureId
      });

      if (error) throw error;
      return data || [];
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
