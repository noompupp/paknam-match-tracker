
import React from 'react';

interface UnassignedGoalsDetectorResult {
  unassignedGoals: any[];
  unassignedGoalsCount: number;
}

interface UnassignedGoalsDetectorProps {
  mergedGoals: any[];
  lastUpdated: number;
  children: (result: UnassignedGoalsDetectorResult) => React.ReactNode;
}

const UnassignedGoalsDetector = ({ mergedGoals, lastUpdated, children }: UnassignedGoalsDetectorProps) => {
  // Enhanced unassigned goals detection with real-time updates
  const unassignedGoals = React.useMemo(() => {
    const unassigned = mergedGoals.filter(goal => 
      goal.playerName === 'Quick Goal' || 
      goal.playerName === 'Unknown Player' ||
      (!goal.playerId && goal.type === 'goal')
    );
    
    console.log('📊 UnassignedGoalsDetector: Enhanced real-time unassigned goals:', {
      count: unassigned.length,
      goals: unassigned.map(g => ({ id: g.id, playerName: g.playerName })),
      lastUpdated
    });
    
    return unassigned;
  }, [mergedGoals, lastUpdated]);

  return <>{children({ unassignedGoals, unassignedGoalsCount: unassignedGoals.length })}</>;
};

export default UnassignedGoalsDetector;
