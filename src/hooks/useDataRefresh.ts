
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { dashboardDataService } from '@/services/dashboardDataService';

export const useDataRefresh = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refreshAllData = async () => {
    console.log('🔄 useDataRefresh: Starting comprehensive data refresh...');
    
    try {
      const result = await dashboardDataService.refreshAllDashboardData(queryClient);
      
      if (result.success) {
        toast({
          title: "Data Refreshed",
          description: result.syncResult?.summary || "All data has been refreshed successfully",
        });
        
        if (result.syncResult?.playersUpdated > 0) {
          toast({
            title: "Stats Updated",
            description: `Updated ${result.syncResult.playersUpdated} players with corrected stats`,
          });
        }
      } else {
        toast({
          title: "Refresh Failed",
          description: result.message || "Failed to refresh data",
          variant: "destructive"
        });
      }
      
      console.log('✅ useDataRefresh: Comprehensive data refresh completed');
      
    } catch (error) {
      console.error('❌ useDataRefresh: Error during data refresh:', error);
      toast({
        title: "Refresh Error",
        description: "An error occurred while refreshing data",
        variant: "destructive"
      });
    }
  };

  const refreshPlayerStats = async () => {
    console.log('📊 useDataRefresh: Refreshing player stats with validation...');
    
    try {
      // Ensure data consistency first
      const consistencyResult = await dashboardDataService.ensureDataConsistency();
      
      queryClient.invalidateQueries({ queryKey: ['enhancedPlayerStats'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      
      if (consistencyResult.needsSync) {
        toast({
          title: "Stats Synchronized",
          description: `Player statistics have been corrected and updated`,
        });
      } else {
        toast({
          title: "Stats Refreshed",
          description: "Player statistics have been updated",
        });
      }
      
    } catch (error) {
      console.error('❌ useDataRefresh: Error refreshing player stats:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh player statistics",
        variant: "destructive"
      });
    }
  };

  const refreshFixtures = () => {
    console.log('🏆 useDataRefresh: Refreshing fixtures...');
    
    queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    queryClient.invalidateQueries({ queryKey: ['matchEvents'] });
    
    toast({
      title: "Fixtures Refreshed",
      description: "Match data has been updated",
    });
  };

  return {
    refreshAllData,
    refreshPlayerStats,
    refreshFixtures
  };
};
