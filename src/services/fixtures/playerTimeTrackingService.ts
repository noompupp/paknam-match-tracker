
import { supabase } from '@/integrations/supabase/client';

interface PlayerTimeEntry {
  fixture_id: number;
  player_id: number;
  player_name: string;
  team_id: number;
  total_minutes: number;
  periods: Array<{
    start_time: number;
    end_time?: number;
    duration?: number;
  }>;
}

export const playerTimeTrackingService = {
  async savePlayerTime(entry: PlayerTimeEntry): Promise<void> {
    console.log('💾 PlayerTimeTrackingService: Saving player time data:', entry);
    
    try {
      const { data, error } = await supabase
        .from('player_time_tracking')
        .upsert({
          fixture_id: entry.fixture_id,
          player_id: entry.player_id,
          player_name: entry.player_name,
          team_id: entry.team_id,
          total_minutes: Math.floor(entry.total_minutes / 60), // Convert seconds to minutes
          periods: entry.periods
        }, {
          onConflict: 'fixture_id,player_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ PlayerTimeTrackingService: Error saving player time:', error);
        throw error;
      }

      console.log('✅ PlayerTimeTrackingService: Player time saved successfully:', data);
    } catch (error) {
      console.error('❌ PlayerTimeTrackingService: Critical error saving player time:', error);
      throw error;
    }
  },

  async getPlayerTimesByFixture(fixtureId: number): Promise<any[]> {
    console.log('🔍 PlayerTimeTrackingService: Getting player times for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase
        .from('player_time_tracking')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('total_minutes', { ascending: false });

      if (error) {
        console.error('❌ PlayerTimeTrackingService: Error fetching player times:', error);
        throw error;
      }

      console.log('✅ PlayerTimeTrackingService: Player times retrieved successfully:', data);
      return data || [];
    } catch (error) {
      console.error('❌ PlayerTimeTrackingService: Critical error fetching player times:', error);
      throw error;
    }
  },

  async getPlayerStats(playerId: number): Promise<any> {
    console.log('📊 PlayerTimeTrackingService: Getting stats for player:', playerId);
    
    try {
      const { data, error } = await supabase
        .from('player_time_tracking')
        .select('*')
        .eq('player_id', playerId);

      if (error) {
        console.error('❌ PlayerTimeTrackingService: Error fetching player stats:', error);
        throw error;
      }

      const totalMinutes = data?.reduce((sum, entry) => sum + entry.total_minutes, 0) || 0;
      const matchesPlayed = data?.length || 0;
      const averageMinutes = matchesPlayed > 0 ? totalMinutes / matchesPlayed : 0;

      const stats = {
        totalMinutes,
        matchesPlayed,
        averageMinutes: Math.round(averageMinutes * 100) / 100,
        entries: data || []
      };

      console.log('✅ PlayerTimeTrackingService: Player stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ PlayerTimeTrackingService: Critical error calculating player stats:', error);
      throw error;
    }
  }
};
