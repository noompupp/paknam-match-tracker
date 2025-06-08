
import React from 'react';
import { useMatchStore } from '@/stores/useMatchStore';

interface GoalMergerResult {
  mergedGoals: any[];
}

interface GoalMergerProps {
  goals: any[];
  children: (result: GoalMergerResult) => React.ReactNode;
}

const GoalMerger = ({ goals, children }: GoalMergerProps) => {
  const { goals: storeGoals, lastUpdated } = useMatchStore();

  // Enhanced goal merging with real-time priority and auto-refresh
  const mergedGoals = React.useMemo(() => {
    console.log('🔄 GoalMerger: Enhanced goal merging with auto-refresh:', {
      storeGoals: storeGoals.length,
      propsGoals: goals.length,
      lastUpdated
    });
    
    // Always prioritize store goals for real-time updates
    if (storeGoals.length > 0) {
      console.log('✅ GoalMerger: Using store goals for enhanced real-time display');
      return storeGoals;
    }
    
    // Fall back to props goals if store is empty (initial load)
    console.log('📥 GoalMerger: Using props goals as fallback');
    return goals;
  }, [storeGoals, goals, lastUpdated]);

  return <>{children({ mergedGoals })}</>;
};

export default GoalMerger;
