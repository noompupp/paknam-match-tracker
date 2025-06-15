import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the 3 most recent 'completed' fixtures
 * that have non-null scores AND at least 1 goal event.
 */
export const useLatestCompleteFixtures = () => {
  return useQuery({
    queryKey: ["fixtures", "team-of-the-week"],
    queryFn: async () => {
      // Step 1: Find the most recent completed match date with >0 completed matches
      const { data: latestDateInfo, error: dateErr } = await supabase
        .from('fixtures')
        .select('match_date')
        .eq('status', 'completed')
        .neq('home_score', null)
        .neq('away_score', null)
        .order('match_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dateErr || !latestDateInfo?.match_date) {
        throw dateErr || new Error("No completed fixtures found");
      }
      const latestDate = latestDateInfo.match_date;

      // Step 2: Get up to 3 completed fixtures from that match_date with scores
      const { data: fixtureRows, error: fixturesErr } = await supabase
        .from('fixtures')
        .select('*')
        .eq('status', 'completed')
        .eq('match_date', latestDate)
        .neq('home_score', null)
        .neq('away_score', null)
        .order('id', { ascending: true })
        .limit(3);

      if (fixturesErr) throw fixturesErr;

      // Step 3: For each fixture, check for at least one goal or assist event
      const fixturesWithEvents = [];
      for (const fixture of fixtureRows || []) {
        const { data: events, error: evtErr } = await supabase
          .from('match_events')
          .select('*')
          .eq('fixture_id', fixture.id)
          .in('event_type', ['goal', 'assist']);

        if (evtErr) throw evtErr;
        if ((events ?? []).length > 0) {
          fixturesWithEvents.push({
            ...fixture,
            goalEvents: events
          });
        }
      }
      // Only keep those with at least events (and up to 3)
      return fixturesWithEvents.slice(0, 3);
    },
    staleTime: 5 * 60 * 1000,
  });
};
