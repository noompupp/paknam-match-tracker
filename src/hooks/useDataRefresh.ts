
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useDataRefresh = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refreshAllData = () => {
    console.log('🔄 useDataRefresh: Refreshing all dashboard data...');
    
    // Invalidate all relevant queries to trigger refresh
    queryClient.invalidateQueries({ queryKey: ['enhancedPlayerStats'] });
    queryClient.invalidateQueries({ queryKey: ['members'] });
    queryClient.invalidateQueries({ queryKey: ['teams'] });
    queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    queryClient.invalidateQueries({ queryKey: ['matchEvents'] });
    queryClient.invalidateQueries({ queryKey: ['topScorers'] });
    queryClient.invalidateQueries({ queryKey: ['topAssists'] });
    
    console.log('✅ useDataRefresh: Data refresh triggered');
  };

  const refreshPlayerStats = () => {
    console.log('📊 useDataRefresh: Refreshing player stats...');
    
    queryClient.invalidateQueries({ queryKey: ['enhancedPlayerStats'] });
    queryClient.invalidateQueries({ queryKey: ['members'] });
    
    toast({
      title: "Stats Refreshed",
      description: "Player statistics have been updated",
    });
  };

  const refreshFixtures = () => {
    console.log('🏆 useDataRefresh: Refreshing fixtures...');
    
    queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    queryClient.invalidateQueries({ queryKey: ['matchEvents'] });
  };

  return {
    refreshAllData,
    refreshPlayerStats,
    refreshFixtures
  };
};
