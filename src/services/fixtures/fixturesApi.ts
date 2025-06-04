
import { supabase } from '@/integrations/supabase/client';

export const fixturesApi = {
  async getAll() {
    console.log('🎯 fixturesApi: Fetching all fixtures...');
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_date', { ascending: true });

    if (error) {
      console.error('❌ fixturesApi: Error fetching fixtures:', error);
      throw error;
    }

    console.log('✅ fixturesApi: Successfully fetched fixtures:', data?.length || 0);
    return data || [];
  },

  async getUpcoming() {
    console.log('🎯 fixturesApi: Fetching upcoming fixtures...');
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .gte('match_date', today)
      .order('match_date', { ascending: true })
      .limit(5);

    if (error) {
      console.error('❌ fixturesApi: Error fetching upcoming fixtures:', error);
      throw error;
    }

    console.log('✅ fixturesApi: Successfully fetched upcoming fixtures:', data?.length || 0);
    return data || [];
  },

  async getRecent() {
    console.log('🎯 fixturesApi: Fetching recent fixtures...');
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .lt('match_date', today)
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .order('match_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ fixturesApi: Error fetching recent fixtures:', error);
      throw error;
    }

    console.log('✅ fixturesApi: Successfully fetched recent fixtures:', data?.length || 0);
    return data || [];
  },

  async updateScore(id: number, homeScore: number, awayScore: number) {
    console.log('🎯 fixturesApi: Updating fixture score:', { id, homeScore, awayScore });
    
    const { data, error } = await supabase
      .from('fixtures')
      .update({
        home_score: homeScore,
        away_score: awayScore
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ fixturesApi: Error updating fixture score:', error);
      throw error;
    }

    console.log('✅ fixturesApi: Successfully updated fixture score');
    return data;
  }
};
