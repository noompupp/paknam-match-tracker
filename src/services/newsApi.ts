
export interface NewsItem {
  id: string;
  message?: string;
  story?: string;
  description?: string;
  link?: string;
  created_time: string;
  type?: string;
  picture?: string;
}

class NewsApiService {
  private readonly FALLBACK_NEWS: NewsItem[] = [
    {
      id: 'fallback-1',
      message: 'Welcome to Paknam FC! Stay tuned for the latest club news and updates.',
      created_time: new Date().toISOString(),
      type: 'Club Update',
      link: 'https://www.facebook.com/PaknamFC'
    },
    {
      id: 'fallback-2',
      message: 'Follow us on Facebook for real-time updates on matches, training sessions, and club events.',
      created_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      type: 'Social Media',
      link: 'https://www.facebook.com/PaknamFC'
    },
    {
      id: 'fallback-3',
      message: 'Check back regularly for match reports, player interviews, and behind-the-scenes content.',
      created_time: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
      type: 'General',
      link: 'https://www.facebook.com/PaknamFC'
    }
  ];

  async getLatestNews(limit: number = 5): Promise<NewsItem[]> {
    try {
      console.log('📰 NewsApi: Attempting to fetch latest news...');
      
      // For now, return fallback news
      // In a real implementation, this would call Facebook Graph API
      // Example: const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/posts?access_token=${accessToken}&limit=${limit}`);
      
      console.log('📰 NewsApi: Using fallback news data');
      return this.FALLBACK_NEWS.slice(0, limit);
      
    } catch (error) {
      console.error('📰 NewsApi: Error fetching news:', error);
      
      // Return fallback news on error
      console.log('📰 NewsApi: Returning fallback news due to error');
      return this.FALLBACK_NEWS.slice(0, limit);
    }
  }

  async getNewsById(id: string): Promise<NewsItem | null> {
    try {
      console.log('📰 NewsApi: Fetching news item with ID:', id);
      
      // Check fallback news first
      const fallbackItem = this.FALLBACK_NEWS.find(item => item.id === id);
      if (fallbackItem) {
        return fallbackItem;
      }

      // In a real implementation, this would call Facebook Graph API
      console.log('📰 NewsApi: News item not found');
      return null;
      
    } catch (error) {
      console.error('📰 NewsApi: Error fetching news item:', error);
      return null;
    }
  }
}

export const newsApi = new NewsApiService();
