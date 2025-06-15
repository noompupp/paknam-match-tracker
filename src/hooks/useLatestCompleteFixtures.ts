import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type FixtureRow = {
  id: number;
  home_team_id: string;
  away_team_id: string;
  team1?: string;
  team2?: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  [key: string]: any;
};

type MatchEventRow = {
  id: number;
  fixture_id: number;
  event_type: string;
  player_name: string;
  team_id: string;
  [key: string]: any;
};

/**
 * Fetches the 3 most recent 'completed' fixtures
 * that have non-null scores AND at least 1 goal/assist event.
 * Skips any fixture/event with an invalid/null id.
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

      // Defensive: Only process rows with a valid numeric id!
      const fixturesWithValidIds = (fixtureRows ?? []).filter(
        (f: any) => typeof f.id === 'number' && !isNaN(f.id)
      );

      const fixturesWithEvents = [];
      for (const fixture of fixturesWithValidIds) {
        const { data: events, error: evtErr } = await supabase
          .from('match_events')
          .select('*')
          .eq('fixture_id', fixture.id)
          .in('event_type', ['goal', 'assist']);

        if (evtErr) throw evtErr;

        // Only accept events with a valid integer ID (skip broken events)
        const validEvents = (events ?? []).filter(
          (e: any) =>
            typeof e.id === 'number' &&
            !isNaN(e.id) &&
            typeof e.fixture_id === 'number' &&
            !isNaN(e.fixture_id)
        );

        if (validEvents.length > 0) {
          fixturesWithEvents.push({
            ...fixture,
            goalEvents: validEvents,
          });
        }
      }

      // Only keep up to 3
      return fixturesWithEvents.slice(0, 3);
    },
    staleTime: 5 * 60 * 1000,
  });
};
