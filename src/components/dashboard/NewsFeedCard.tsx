
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Rss, Sparkles } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import EnhancedNewsCard from "./EnhancedNewsCard";

const NewsFeedCard = () => {
  const { data: newsItems, isLoading, error } = useNews(4); // Get 4 latest news items
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  const handleNewsClick = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const featuredNews = newsItems?.find(item => item.featured);
  const regularNews = newsItems?.filter(item => !item.featured).slice(0, 3);

  if (isLoading) {
    return (
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Rss className="h-5 w-5 text-primary" />
            Club News
          </CardTitle>
          <Skeleton className="h-9 w-20" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Featured Article Skeleton */}
          {!isMobilePortrait && (
            <div className="grid md:grid-cols-2 gap-0 rounded-xl overflow-hidden border">
              <Skeleton className="aspect-[16/10]" />
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          )}

          {/* News Grid Skeleton */}
          <div className={cn("grid gap-4", isMobilePortrait ? "grid-cols-1" : "grid-cols-3")}>
            {Array.from({ length: isMobilePortrait ? 4 : 3 }).map((_, index) => (
              <div key={index} className="rounded-lg overflow-hidden border">
                <Skeleton className={cn("w-full", isMobilePortrait ? "aspect-[16/9]" : "aspect-[16/10]")} />
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Rss className="h-5 w-5 text-primary" />
            Club News
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
              <Rss className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-muted-foreground">Unable to load news</h3>
              <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">
                We're having trouble fetching the latest club updates. Check back later or visit our Facebook page.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open('https://www.facebook.com/PaknamFC', '_blank')}
              className="mt-4"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Facebook Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Rss className="h-5 w-5 text-primary" />
            Club News
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No recent news</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Stay tuned for exciting club updates, match reports, and behind-the-scenes content.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open('https://www.facebook.com/PaknamFC', '_blank')}
              className="mt-4"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Follow Us on Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow-lg animate-fade-in overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02]">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Rss className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span>Club News</span>
            <div className="text-xs font-normal text-muted-foreground mt-0.5">
              Latest updates & stories
            </div>
          </div>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('https://www.facebook.com/PaknamFC', '_blank')}
          className="text-muted-foreground hover:text-foreground px-3 group"
        >
          <span className="hidden sm:inline mr-2">See All</span>
          <span className="sm:hidden text-xs mr-2">More</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Featured News */}
        {featuredNews && !isMobilePortrait && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Featured Story</span>
            </div>
            <EnhancedNewsCard 
              item={featuredNews} 
              featured={true}
              onClick={handleNewsClick}
            />
          </div>
        )}

        {/* News Grid */}
        <div className="space-y-3">
          {(!featuredNews || isMobilePortrait) && (
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-8 bg-primary rounded-full" />
              <span className="text-sm font-semibold">Latest Stories</span>
            </div>
          )}
          
          <div className={cn(
            "grid gap-4",
            isMobilePortrait ? "grid-cols-1" : "grid-cols-3"
          )}>
            {(isMobilePortrait ? newsItems : regularNews)?.map((item) => (
              <EnhancedNewsCard 
                key={item.id}
                item={item}
                onClick={handleNewsClick}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsFeedCard;
