
import { useQuery } from '@tanstack/react-query';
import { newsApi } from '@/services/newsApi';

export const useNews = (limit: number = 5) => {
  return useQuery({
    queryKey: ['news', limit],
    queryFn: async () => {
      console.log('🗞️ useNews: Starting query for', limit, 'items...');
      try {
        const news = await newsApi.getLatestNews(limit);
        console.log('🗞️ useNews: Query successful, news items:', news);
        return news;
      } catch (error) {
        console.error('🗞️ useNews: Query failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log('🗞️ useNews: Retry attempt:', failureCount, 'Error:', error);
      return failureCount < 2; // Only retry once for news
    },
    // Don't throw on error, return undefined instead
    throwOnError: false
  });
};
