
import { useQueryClient } from '@tanstack/react-query';
import { comprehensiveDataSyncService } from './fixtures/comprehensiveDataSyncService';

export const dashboardDataService = {
  async refreshAllDashboardData(queryClient: any) {
    console.log('🔄 DashboardDataService: Refreshing all dashboard data...');
    
    try {
      // Perform comprehensive data sync first
      const syncResult = await comprehensiveDataSyncService.performFullDataSync();
      
      console.log('📊 DashboardDataService: Data sync completed:', syncResult);
      
      // Invalidate all relevant queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['enhancedPlayerStats'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      queryClient.invalidateQueries({ queryKey: ['matchEvents'] });
      queryClient.invalidateQueries({ queryKey: ['topScorers'] });
      queryClient.invalidateQueries({ queryKey: ['topAssists'] });
      
      console.log('✅ DashboardDataService: All dashboard data refreshed');
      
      return {
        success: true,
        syncResult,
        message: 'Dashboard data refreshed successfully'
      };
      
    } catch (error) {
      console.error('❌ DashboardDataService: Error refreshing dashboard data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to refresh dashboard data'
      };
    }
  },

  async ensureDataConsistency() {
    console.log('🔧 DashboardDataService: Ensuring data consistency...');
    
    try {
      const validationResult = await comprehensiveDataSyncService.validateAllPlayerStats();
      
      if (validationResult.invalid > 0) {
        console.log('⚠️ DashboardDataService: Data inconsistencies found, performing sync...');
        const syncResult = await comprehensiveDataSyncService.performFullDataSync();
        return { needsSync: true, syncResult };
      } else {
        console.log('✅ DashboardDataService: Data is consistent');
        return { needsSync: false, validationResult };
      }
      
    } catch (error) {
      console.error('❌ DashboardDataService: Error ensuring data consistency:', error);
      throw error;
    }
  }
};
