
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, ExternalLink, Rss } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { formatDistanceToNow } from "date-fns";

const NewsFeedCard = () => {
  const { data: newsItems, isLoading, error } = useNews(3); // Get 3 latest news items
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  const handleNewsClick = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <Rss className="h-5 w-5 text-primary" />
          Club News
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('https://www.facebook.com/PaknamFC', '_blank')}
          className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
        >
          <span className="hidden sm:inline mr-1">See More</span>
          <span className="sm:hidden text-xs mr-1">More</span>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className={`${isMobilePortrait ? 'space-y-3 px-3' : 'space-y-4 px-6'}`}>
        {isLoading ? (
          <div className={`${isMobilePortrait ? 'space-y-2' : 'space-y-3'}`}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`${isMobilePortrait ? 'p-3' : 'p-4'} rounded-lg bg-muted/20`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-3xl">📰</div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Unable to load news</p>
              <p className="text-xs text-muted-foreground">Check back later for club updates</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://www.facebook.com/PaknamFC', '_blank')}
              className="mt-2"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Visit Facebook
            </Button>
          </div>
        ) : newsItems && newsItems.length > 0 ? (
          <div className={`${isMobilePortrait ? 'space-y-2' : 'space-y-3'}`}>
            {newsItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`${isMobilePortrait ? 'p-3' : 'p-4'} rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group`}
                onClick={() => handleNewsClick(item.link)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.type || 'News'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{getTimeAgo(item.created_time)}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm leading-tight line-clamp-2">
                      {item.message || item.story || 'Club Update'}
                    </h4>
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="text-3xl">📰</div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No recent news</p>
              <p className="text-xs text-muted-foreground">Stay tuned for club updates</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://www.facebook.com/PaknamFC', '_blank')}
              className="mt-2"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Visit Facebook
            </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFeedCard;
