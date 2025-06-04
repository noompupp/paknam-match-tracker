
import { getAllFixtures, getUpcomingFixtures, getRecentFixtures } from './fixturesQueries';
import { supabase } from '@/integrations/supabase/client';

export const fixturesApi = {
  async getAll() {
    console.log('🎯 fixturesApi: Fetching all fixtures...');
    try {
      const fixtures = await getAllFixtures();
      console.log('✅ fixturesApi: Successfully fetched fixtures:', fixtures?.length || 0);
      return fixtures || [];
    } catch (error) {
      console.error('❌ fixturesApi: Error fetching fixtures:', error);
      throw error;
    }
  },

  async getUpcoming() {
    console.log('🎯 fixturesApi: Fetching upcoming fixtures...');
    try {
      const fixtures = await getUpcomingFixtures();
      console.log('✅ fixturesApi: Successfully fetched upcoming fixtures:', fixtures?.length || 0);
      return fixtures || [];
    } catch (error) {
      console.error('❌ fixturesApi: Error fetching upcoming fixtures:', error);
      throw error;
    }
  },

  async getRecent() {
    console.log('🎯 fixturesApi: Fetching recent fixtures...');
    try {
      const fixtures = await getRecentFixtures();
      console.log('✅ fixturesApi: Successfully fetched recent fixtures:', fixtures?.length || 0);
      return fixtures || [];
    } catch (error) {
      console.error('❌ fixturesApi: Error fetching recent fixtures:', error);
      throw error;
    }
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
