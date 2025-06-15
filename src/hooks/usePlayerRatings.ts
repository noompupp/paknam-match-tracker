
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/contexts/SecureAuthContext";

/**
 * Hook to fetch ratings for the active fixture.
 */
export function usePlayerRatings(fixtureId: number | null) {
  const { user } = useSecureAuth();
  const queryKey = ["player_ratings", fixtureId, user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!fixtureId && !!user,
    queryFn: async () => {
      if (!fixtureId || !user) return [];
      const { data, error } = await supabase
        .from("player_ratings")
        .select("*")
        .eq("fixture_id", fixtureId)
        .eq("rater_id", user.id);

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  return query;
}

/**
 * Hook to submit or update a rating.
 */
export function useSubmitPlayerRating() {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();

  return useMutation({
    mutationFn: async ({
      fixtureId,
      playerId,
      rating,
    }: {
      fixtureId: number;
      playerId: number;
      rating: number;
    }) => {
      if (!user) throw new Error("Not logged in");
      // Upsert: Insert or update (enforces uniqueness by RLS + index)
      const { data, error } = await supabase
        .from("player_ratings")
        .upsert(
          [
            {
              fixture_id: fixtureId,
              player_id: playerId,
              rater_id: user.id,
              rating,
            },
          ],
          { onConflict: "fixture_id,player_id,rater_id", ignoreDuplicates: false }
        );
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data, vars) => {
      // Refresh rating queries for fixture after submit
      queryClient.invalidateQueries({
        queryKey: ["player_ratings", vars.fixtureId, user?.id],
      });
    },
  });
}
