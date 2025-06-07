
import { supabase } from '@/integrations/supabase/client';

export const calculateAndUpdatePositions = async (): Promise<void> => {
  console.log('🏆 PositionCalculationService: Starting position calculation...');
  
  try {
    // Get all teams sorted by league position criteria
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, points, goal_difference, goals_for, position, previous_position')
      .order('points', { ascending: false })
      .order('goal_difference', { ascending: false })
      .order('goals_for', { ascending: false })
      .order('name', { ascending: true }); // Tie-breaker by alphabetical order

    if (teamsError) {
      console.error('❌ PositionCalculationService: Error fetching teams:', teamsError);
      throw teamsError;
    }

    if (!teams || teams.length === 0) {
      console.warn('⚠️ PositionCalculationService: No teams found');
      return;
    }

    console.log('📊 PositionCalculationService: Teams before position update:', 
      teams.map(t => ({ 
        name: t.name, 
        points: t.points, 
        gd: t.goal_difference,
        currentPos: t.position,
        previousPos: t.previous_position 
      }))
    );

    // Update positions for all teams, preserving previous position before updating current
    const updatePromises = teams.map((team, index) => {
      const newPosition = index + 1;
      
      console.log(`🔄 PositionCalculationService: Updating ${team.name} from position ${team.position} to ${newPosition} (previous: ${team.previous_position})`);
      
      return supabase
        .from('teams')
        .update({ 
          previous_position: team.position, // Store current position as previous
          position: newPosition // Update to new position
        })
        .eq('id', team.id);
    });

    const results = await Promise.all(updatePromises);
    
    // Check for any errors in the updates
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ PositionCalculationService: Some position updates failed:', errors);
      throw new Error(`Failed to update positions for ${errors.length} teams`);
    }

    console.log('✅ PositionCalculationService: Successfully updated all team positions with rank tracking');
    
    // Log final positions with rank changes
    const finalPositions = teams.map((team, index) => ({
      position: index + 1,
      name: team.name,
      points: team.points,
      goalDifference: team.goal_difference,
      previousPosition: team.position, // This was the old position before update
      rankChange: team.position - (index + 1) // Calculate change (negative = moved up, positive = moved down)
    }));
    
    console.log('🏆 PositionCalculationService: Final league table with rank changes:', finalPositions);

  } catch (error) {
    console.error('❌ PositionCalculationService: Critical error in position calculation:', error);
    throw error;
  }
};
