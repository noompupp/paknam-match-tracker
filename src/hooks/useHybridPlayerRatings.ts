
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
    goals?: number;
    assists?: number;
    cards?: number;
    goals_conceded: number;
    clean_sheet_eligible: boolean;
    clean_sheet_achieved?: boolean;
  };
  original_fpl_rating?: number;
  original_participation_rating?: number;
  was_adjusted?: boolean;
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
  position: string;
  fpl_rating: number;
  participation_rating: number;
  final_rating: number;
  original_fpl_rating?: number;
  original_participation_rating?: number;
  adjusted_fpl_rating?: number;
  adjusted_participation_rating?: number;
  was_adjusted: boolean;
  approved_by: string;
  approved_at: string;
  created_at: string;
  updated_at: string;
  rating_data: HybridRatingData;
}

// Helper function to parse JSON rating data
function parseRatingData(data: any): HybridRatingData {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse rating data:', e);
      return {
        player_id: 0,
        player_name: 'Unknown',
        team_id: '',
        position: 'Player',
        minutes_played: 0,
        match_result: 'draw',
        fpl_points: 0,
        fpl_rating: 6.0,
        participation_rating: 6.0,
        final_rating: 6.0,
        rating_breakdown: {
          goals_conceded: 0,
          clean_sheet_eligible: false
        }
      };
    }
  }
  return data as HybridRatingData;
}

/**
 * Hook to fetch calculated hybrid ratings for a fixture
 */
export function useHybridPlayerRatings(fixtureId: number | null) {
  const query = useQuery({
    queryKey: ["hybrid_player_ratings", fixtureId],
    enabled: !!fixtureId,
    queryFn: async (): Promise<PlayerRatingRow[]> => {
      if (!fixtureId) return [];
      
      console.log('Fetching hybrid ratings for fixture:', fixtureId);
      
      // First, try to generate ratings if they don't exist
      const { data: generationResult, error: generationError } = await supabase
        .rpc('generate_fixture_player_ratings', { p_fixture_id: fixtureId });
      
      if (generationError) {
        console.warn('Could not generate ratings:', generationError);
      } else {
        console.log('Rating generation result:', generationResult);
      }
      
      // Fetch the ratings using the database function
      const { data: ratingsData, error } = await supabase
        .rpc('get_fixture_player_ratings', { p_fixture_id: fixtureId });
      
      if (error) {
        console.error('Error fetching ratings:', error);
        throw error;
      }

      console.log('Retrieved ratings data:', ratingsData);

      return (ratingsData || []).map(rating => ({
        player_id: rating.player_id,
        player_name: rating.player_name,
        team_id: rating.team_id,
        team_name: rating.team_name,
        position: rating.player_position,
        rating_data: parseRatingData(rating.rating_data)
      }));
    },
    staleTime: 2 * 60 * 1000,
  });

  return query;
}

/**
 * Hook to fetch approved ratings for a fixture
 */
export function useApprovedPlayerRatings(fixtureId: number | null) {
  const query = useQuery({
    queryKey: ["approved_player_ratings", fixtureId],
    enabled: !!fixtureId,
    queryFn: async (): Promise<ApprovedRating[]> => {
      if (!fixtureId) return [];
      
      console.log('Fetching approved ratings for fixture:', fixtureId);
      
      const { data, error } = await supabase
        .from("approved_player_ratings")
        .select("*")
        .eq("fixture_id", fixtureId);

      if (error) {
        console.error('Error fetching approved ratings:', error);
        throw error;
      }

      console.log('Retrieved approved ratings:', data);

      return (data || []).map(rating => ({
        ...rating,
        rating_data: parseRatingData(rating.rating_data)
      }));
    },
    staleTime: 30 * 1000,
  });

  return query;
}

/**
 * Hook to approve a player's rating with optional adjustments
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
      position = 'Player',
      adjustedFplRating,
      adjustedParticipationRating
    }: {
      fixtureId: number;
      playerId: number;
      playerName: string;
      teamId: string;
      position?: string;
      adjustedFplRating?: number;
      adjustedParticipationRating?: number;
    }) => {
      if (!user) throw new Error("Not logged in");
      
      console.log('Approving rating with params:', {
        fixtureId,
        playerId,
        playerName,
        teamId,
        position,
        adjustedFplRating,
        adjustedParticipationRating
      });
      
      const { data, error } = await supabase
        .rpc('approve_player_rating', {
          p_fixture_id: fixtureId,
          p_player_id: playerId,
          p_player_name: playerName,
          p_team_id: teamId,
          p_position: position,
          p_adjusted_fpl_rating: adjustedFplRating,
          p_adjusted_participation_rating: adjustedParticipationRating
        });

      if (error) {
        console.error('Error approving rating:', error);
        throw error;
      }
      
      console.log('Rating approval result:', data);
      return data;
    },
    onSuccess: (data, vars) => {
      console.log('Rating approved successfully, invalidating queries');
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
