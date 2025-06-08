
import { supabase } from '@/integrations/supabase/client';

export const calculateAndUpdatePositions = async (): Promise<void> => {
  console.log('🏆 PositionCalculationService: Starting position calculation...');
  
  try {
    // Get all teams sorted by Premier League tie-breaking rules
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, points, goal_difference, goals_for, position, previous_position')
      .order('points', { ascending: false })        // 1st: Points (highest first)
      .order('goal_difference', { ascending: false }) // 2nd: Goal Difference (highest first)
      .order('goals_for', { ascending: false })      // 3rd: Goals Scored (highest first)
      .order('name', { ascending: true });           // 4th: Alphabetical (for consistency)

    if (teamsError) {
      console.error('❌ PositionCalculationService: Error fetching teams:', teamsError);
      throw teamsError;
    }

    if (!teams || teams.length === 0) {
      console.warn('⚠️ PositionCalculationService: No teams found');
      return;
    }

    console.log('📊 PositionCalculationService: Teams sorted by Premier League rules:', 
      teams.map((t, index) => ({ 
        position: index + 1,
        name: t.name, 
        points: t.points, 
        goalDifference: t.goal_difference,
        goalsFor: t.goals_for,
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

    console.log('✅ PositionCalculationService: Successfully updated all team positions with Premier League tie-breaking rules');
    
    // Log final positions with rank changes
    const finalPositions = teams.map((team, index) => ({
      position: index + 1,
      name: team.name,
      points: team.points,
      goalDifference: team.goal_difference,
      goalsFor: team.goals_for,
      previousPosition: team.position, // This was the old position before update
      rankChange: team.position - (index + 1) // Calculate change (negative = moved up, positive = moved down)
    }));
    
    console.log('🏆 PositionCalculationService: Final league table with Premier League ranking:', finalPositions);

  } catch (error) {
    console.error('❌ PositionCalculationService: Critical error in position calculation:', error);
    throw error;
  }
};
