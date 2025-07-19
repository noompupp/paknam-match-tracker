
import { supabase } from '@/integrations/supabase/client';

export const positionTrackingService = {
  /**
   * Initialize previous positions for all teams that don't have them set
   */
  async initializePreviousPositions(): Promise<{ updated: number; errors: string[] }> {
    console.log('🔄 PositionTracking: Initializing previous positions...');
    
    try {
      // Get all teams that don't have previous_position set
      const { data: teamsWithoutPrevious, error: fetchError } = await supabase
        .from('teams')
        .select('id, name, position, previous_position')
        .is('previous_position', null);

      if (fetchError) {
        console.error('❌ PositionTracking: Error fetching teams:', fetchError);
        return { updated: 0, errors: [fetchError.message] };
      }

      if (!teamsWithoutPrevious || teamsWithoutPrevious.length === 0) {
        console.log('✅ PositionTracking: All teams already have previous positions set');
        return { updated: 0, errors: [] };
      }

      console.log(`🔧 PositionTracking: Found ${teamsWithoutPrevious.length} teams without previous positions`);

      // Update each team to set previous_position = current position
      const updatePromises = teamsWithoutPrevious.map(team => 
        supabase
          .from('teams')
          .update({ previous_position: team.position })
          .eq('id', team.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results
        .filter(result => result.error)
        .map(result => result.error!.message);

      const successCount = results.filter(result => !result.error).length;

      console.log(`✅ PositionTracking: Initialized previous positions for ${successCount} teams`);
      
      if (errors.length > 0) {
        console.error('❌ PositionTracking: Some updates failed:', errors);
      }

      return { updated: successCount, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ PositionTracking: Critical error:', error);
      return { updated: 0, errors: [errorMessage] };
    }
  },

  /**
   * Verify that position changes are being tracked properly
   */
  async verifyPositionTracking(): Promise<{ 
    teamsWithPositions: number; 
    teamsWithPrevious: number; 
    teamsWithChanges: number;
    sampleChanges: Array<{ name: string; current: number; previous: number | null; change: number }>;
  }> {
    console.log('🔍 PositionTracking: Verifying position tracking...');
    
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select('name, position, previous_position')
        .order('position', { ascending: true });

      if (error) {
        console.error('❌ PositionTracking: Error fetching teams for verification:', error);
        throw error;
      }

      if (!teams) {
        return { teamsWithPositions: 0, teamsWithPrevious: 0, teamsWithChanges: 0, sampleChanges: [] };
      }

      const teamsWithPositions = teams.filter(t => t.position).length;
      const teamsWithPrevious = teams.filter(t => t.previous_position !== null).length;
      const teamsWithChanges = teams.filter(t => 
        t.previous_position !== null && t.position !== t.previous_position
      ).length;

      const sampleChanges = teams
        .filter(t => t.previous_position !== null && t.position !== t.previous_position)
        .slice(0, 5)
        .map(t => ({
          name: t.name,
          current: t.position,
          previous: t.previous_position,
          change: t.previous_position ? t.previous_position - t.position : 0
        }));

      console.log('📊 PositionTracking: Verification results:', {
        teamsWithPositions,
        teamsWithPrevious,
        teamsWithChanges,
        sampleChanges
      });

      return { teamsWithPositions, teamsWithPrevious, teamsWithChanges, sampleChanges };

    } catch (error) {
      console.error('❌ PositionTracking: Error during verification:', error);
      throw error;
    }
  },

  /**
   * Force a position calculation update for testing
   */
  async triggerPositionUpdate(): Promise<{ success: boolean; message: string }> {
    console.log('🚀 PositionTracking: Triggering manual position update...');
    
    try {
      // Import the position calculation service
      const { calculateAndUpdatePositions } = await import('./positionCalculationService');
      
      await calculateAndUpdatePositions();
      
      console.log('✅ PositionTracking: Manual position update completed');
      return { success: true, message: 'Position update completed successfully' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ PositionTracking: Error during manual update:', error);
      return { success: false, message: `Position update failed: ${errorMessage}` };
    }
  }
};
