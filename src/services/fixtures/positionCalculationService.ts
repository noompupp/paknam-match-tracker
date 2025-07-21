
import { supabase } from '@/integrations/supabase/client';
import { calculateHeadToHeadResults } from './headToHeadService';

export const calculateAndUpdatePositions = async (): Promise<void> => {
  console.log('🏆 PositionCalculationService: Starting position calculation with H2H tie-breaking...');
  
  try {
    // Get all teams with their current stats
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, points, goal_difference, goals_for, position, previous_position, __id__')
      .order('points', { ascending: false })
      .order('goal_difference', { ascending: false })
      .order('goals_for', { ascending: false });

    if (teamsError) {
      console.error('❌ PositionCalculationService: Error fetching teams:', teamsError);
      throw teamsError;
    }

    if (!teams || teams.length === 0) {
      console.warn('⚠️ PositionCalculationService: No teams found');
      return;
    }

    console.log('📊 PositionCalculationService: Teams before H2H processing:', 
      teams.map(t => ({ 
        name: t.name, 
        points: t.points, 
        goalDifference: t.goal_difference,
        goalsFor: t.goals_for,
        currentPosition: t.position,
        previousPosition: t.previous_position
      }))
    );

    // Group teams with identical stats for H2H resolution
    const groupedTeams: any[][] = [];
    let currentGroup: any[] = [];
    
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      
      if (currentGroup.length === 0) {
        currentGroup.push(team);
      } else {
        const prevTeam = currentGroup[currentGroup.length - 1];
        
        // Check if teams have identical Premier League tie-breaking stats
        if (team.points === prevTeam.points && 
            team.goal_difference === prevTeam.goal_difference && 
            team.goals_for === prevTeam.goals_for) {
          currentGroup.push(team);
        } else {
          groupedTeams.push([...currentGroup]);
          currentGroup = [team];
        }
      }
    }
    
    // Don't forget the last group
    if (currentGroup.length > 0) {
      groupedTeams.push(currentGroup);
    }

    console.log('👥 PositionCalculationService: Teams grouped for H2H:', 
      groupedTeams.map(group => ({
        groupSize: group.length,
        teams: group.map(t => t.name),
        needsH2H: group.length > 1
      }))
    );

    // Apply H2H to tied groups and flatten the result
    const finalOrderedTeams: any[] = [];
    
    for (const group of groupedTeams) {
      if (group.length > 1) {
        console.log('🤝 PositionCalculationService: Applying H2H to group:', group.map(t => t.name));
        const h2hSortedGroup = await calculateHeadToHeadResults(group);
        finalOrderedTeams.push(...h2hSortedGroup);
      } else {
        finalOrderedTeams.push(...group);
      }
    }

    console.log('🏆 PositionCalculationService: Final team order with H2H:', 
      finalOrderedTeams.map((t, index) => ({ 
        position: index + 1,
        name: t.name, 
        points: t.points, 
        goalDifference: t.goal_difference,
        goalsFor: t.goals_for,
        oldPosition: t.position,
        oldPrevious: t.previous_position
      }))
    );

    // Update positions for all teams with proper previous position tracking
    const updatePromises = finalOrderedTeams.map((team, index) => {
      const newPosition = index + 1;
      const currentPosition = team.position;
      
      console.log(`🔄 PositionCalculationService: Updating ${team.name}:`, {
        currentPosition,
        newPosition,
        willSetPrevious: currentPosition,
        change: currentPosition - newPosition
      });
      
      return supabase
        .from('teams')
        .update({ 
          previous_position: currentPosition, // Store current position as previous
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

    console.log('✅ PositionCalculationService: Successfully updated all team positions with H2H tie-breaking');
    
    // Log final positions with rank changes
    const finalPositions = finalOrderedTeams.map((team, index) => ({
      position: index + 1,
      name: team.name,
      points: team.points,
      goalDifference: team.goal_difference,
      goalsFor: team.goals_for,
      previousPosition: team.position, // This was the old position before update
      rankChange: team.position - (index + 1) // Calculate change (negative = moved up, positive = moved down)
    }));
    
    console.log('🏆 PositionCalculationService: Final league table with rank changes:', finalPositions);

  } catch (error) {
    console.error('❌ PositionCalculationService: Critical error in position calculation:', error);
    throw error;
  }
};
