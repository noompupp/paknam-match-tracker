import { supabase } from "@/integrations/supabase/client";

/**
 * Untyped Supabase client for the season-roster tables.
 *
 * The generated `integrations/supabase/types.ts` predates the current season
 * schema and still describes the older `members` shape, so `players`, `rosters`
 * and `seasons` cannot be reached through the typed client. Queries here are
 * hand-typed at the call site instead; regenerating the Supabase types will
 * make this file unnecessary.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedSupabaseClient = any;

export const gameDb = supabase as unknown as UntypedSupabaseClient;
