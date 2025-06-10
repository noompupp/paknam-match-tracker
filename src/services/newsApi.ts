
export interface NewsItem {
  id: string;
  title: string;
  message?: string;
  story?: string;
  description?: string;
  link?: string;
  created_time: string;
  type?: string;
  category: 'match' | 'transfer' | 'training' | 'announcement' | 'general';
  picture?: string;
  author?: string;
  read_time?: number;
  featured?: boolean;
}

class NewsApiService {
  private readonly FALLBACK_NEWS: NewsItem[] = [
    {
      id: 'fallback-1',
      title: 'Victory Against Bangkok United FC',
      message: 'Paknam FC secured a dominant 3-1 victory in last night\'s thrilling match at home stadium.',
      description: 'An outstanding team performance with goals from our top strikers. The crowd was electric as we maintained our winning streak.',
      created_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      type: 'Match Report',
      category: 'match',
      picture: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop',
      author: 'Sports Desk',
      read_time: 3,
      featured: true,
      link: 'https://www.facebook.com/PaknamFC'
    },
    {
      id: 'fallback-2',
      title: 'New Signing: Midfielder Joins the Squad',
      message: 'We\'re excited to announce the signing of talented midfielder Alex Chen from the youth academy.',
      description: 'The 22-year-old brings fresh energy and exceptional passing skills to strengthen our midfield.',
      created_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      type: 'Transfer News',
      category: 'transfer',
      picture: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=250&fit=crop',
      author: 'Transfer Team',
      read_time: 2,
      featured: false,
      link: 'https://www.facebook.com/PaknamFC'
    },
    {
      id: 'fallback-3',
      title: 'Training Camp This Weekend',
      message: 'Join us for an intensive training camp to prepare for the upcoming championship matches.',
      description: 'All squad members are expected to attend. Focus will be on tactical formations and fitness.',
      created_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      type: 'Training Update',
      category: 'training',
      picture: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
      author: 'Coaching Staff',
      read_time: 1,
      featured: false,
      link: 'https://www.facebook.com/PaknamFC'
    },
    {
      id: 'fallback-4',
      title: 'Club Championship Finals Announcement',
      message: 'We\'ve officially qualified for the regional championship finals next month!',
      description: 'After months of hard work and dedication, our team has secured a spot in the most prestigious tournament.',
      created_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      type: 'Official News',
      category: 'announcement',
      picture: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
      author: 'Club Management',
      read_time: 4,
      featured: true,
      link: 'https://www.facebook.com/PaknamFC'
    }
  ];

  async getLatestNews(limit: number = 5): Promise<NewsItem[]> {
    try {
      console.log('📰 NewsApi: Attempting to fetch latest news...');
      
      // For now, return fallback news sorted by featured first, then by date
      // In a real implementation, this would call Facebook Graph API
      console.log('📰 NewsApi: Using enhanced fallback news data');
      
      const sortedNews = this.FALLBACK_NEWS
        .sort((a, b) => {
          // Featured articles first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Then by date (newest first)
          return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
        })
        .slice(0, limit);
      
      return sortedNews;
      
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

  getCategoryIcon(category: NewsItem['category']): string {
    const iconMap = {
      match: '⚽',
      transfer: '🔄',
      training: '🏃‍♂️',
      announcement: '📢',
      general: '📰'
    };
    return iconMap[category] || '📰';
  }

  getCategoryColor(category: NewsItem['category']): string {
    const colorMap = {
      match: 'bg-green-500/10 text-green-600 border-green-500/20',
      transfer: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      training: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      announcement: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      general: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    };
    return colorMap[category] || colorMap.general;
  }
}

export const newsApi = new NewsApiService();
