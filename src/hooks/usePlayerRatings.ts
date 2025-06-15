
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/contexts/SecureAuthContext";

/** Local type until codegen is updated */
export interface PlayerRating {
  id: number;
  fixture_id: number;
  player_id: number;
  rater_id: string;
  rating: number;
  created_at: string;
}

/**
 * Hook to fetch ratings for the active fixture.
 */
export function usePlayerRatings(fixtureId: number | null) {
  const { user } = useSecureAuth();
  const queryKey = ["player_ratings", fixtureId, user?.id];

  // NOTE: <any> cast workaround so we can use from("player_ratings") until the codegen is updated!
  const query = useQuery<PlayerRating[]>({
    queryKey,
    enabled: !!fixtureId && !!user,
    queryFn: async () => {
      if (!fixtureId || !user) return [];
      // @ts-expect-error: player_ratings is not in the Supabase .types.ts (it's a custom table)
      const { data, error } = (supabase as any)
        .from("player_ratings")
        .select("*")
        .eq("fixture_id", fixtureId)
        .eq("rater_id", user.id);

      if (error) throw error;
      // Defensive: data could be unknown/null, so ensure correct typing
      return Array.isArray(data)
        ? (data as PlayerRating[])
        : [];
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
      // @ts-expect-error: player_ratings is not in Supabase typed client
      const { data, error } = (supabase as any)
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
      // Defensive: data could be null/unknown, so safely type it
      return Array.isArray(data) && data.length > 0
        ? (data[0] as PlayerRating)
        : null;
    },
    onSuccess: (data, vars) => {
      // Refresh rating queries for fixture after submit
      queryClient.invalidateQueries({
        queryKey: ["player_ratings", vars.fixtureId, user?.id],
      });
    },
  });
}
