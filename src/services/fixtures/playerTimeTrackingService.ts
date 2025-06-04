
import { supabase } from '@/integrations/supabase/client';

interface PlayerTimePeriod {
  start_time: number;
  end_time: number;
  duration: number;
}

interface PlayerTimeData {
  fixture_id: number;
  player_id: number;
  player_name: string;
  team_id: number;
  total_minutes: number;
  periods: PlayerTimePeriod[];
}

export const playerTimeTrackingService = {
  async savePlayerTime(data: PlayerTimeData): Promise<void> {
    console.log('⏱️ PlayerTimeTrackingService: Saving player time data:', data);
    
    try {
      // Check if record already exists
      const { data: existing, error: checkError } = await supabase
        .from('player_time_tracking')
        .select('id')
        .eq('fixture_id', data.fixture_id)
        .eq('player_id', data.player_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('player_time_tracking')
          .update({
            total_minutes: data.total_minutes,
            periods: data.periods,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          throw updateError;
        }

        console.log('✅ PlayerTimeTrackingService: Updated existing player time record');
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('player_time_tracking')
          .insert([{
            fixture_id: data.fixture_id,
            player_id: data.player_id,
            player_name: data.player_name,
            team_id: data.team_id,
            total_minutes: data.total_minutes,
            periods: data.periods
          }]);

        if (insertError) {
          throw insertError;
        }

        console.log('✅ PlayerTimeTrackingService: Created new player time record');
      }
    } catch (error) {
      console.error('❌ PlayerTimeTrackingService: Error saving player time:', error);
      throw error;
    }
  },

  async getPlayerTimesForFixture(fixtureId: number): Promise<PlayerTimeData[]> {
    console.log('📊 PlayerTimeTrackingService: Getting player times for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase
        .from('player_time_tracking')
        .select('*')
        .eq('fixture_id', fixtureId);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ PlayerTimeTrackingService: Error fetching player times:', error);
      throw error;
    }
  },

  async deletePlayerTimesForFixture(fixtureId: number): Promise<number> {
    console.log('🗑️ PlayerTimeTrackingService: Deleting player times for fixture:', fixtureId);
    
    try {
      const { data, error } = await supabase
        .from('player_time_tracking')
        .delete()
        .eq('fixture_id', fixtureId)
        .select();

      if (error) {
        throw error;
      }

      const deletedCount = data?.length || 0;
      console.log(`✅ PlayerTimeTrackingService: Deleted ${deletedCount} player time records`);
      return deletedCount;
    } catch (error) {
      console.error('❌ PlayerTimeTrackingService: Error deleting player times:', error);
      throw error;
    }
  }
};
