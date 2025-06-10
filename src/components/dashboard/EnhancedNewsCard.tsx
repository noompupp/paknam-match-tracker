
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, User, ArrowRight } from "lucide-react";
import { NewsItem, newsApi } from "@/services/newsApi";
import { formatDistanceToNow } from "date-fns";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { cn } from "@/lib/utils";

interface EnhancedNewsCardProps {
  item: NewsItem;
  featured?: boolean;
  onClick?: (url?: string) => void;
}

const EnhancedNewsCard = ({ item, featured = false, onClick }: EnhancedNewsCardProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(item.link);
    }
  };

  if (featured && !isMobilePortrait) {
    // Featured card layout for desktop/tablet
    return (
      <div
        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="grid md:grid-cols-2 gap-0 h-full">
          {/* Image Section */}
          <div className="relative overflow-hidden">
            <div className="aspect-[16/10] bg-gradient-to-br from-muted/40 to-muted/20">
              {item.picture ? (
                <img
                  src={item.picture}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-muted-foreground/30">
                  {newsApi.getCategoryIcon(item.category)}
                </div>
              )}
            </div>
            
            {/* Category Badge Overlay */}
            <div className="absolute top-4 left-4">
              <Badge className={cn("text-xs font-semibold", newsApi.getCategoryColor(item.category))}>
                {newsApi.getCategoryIcon(item.category)} {item.type || item.category}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {item.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {item.description || item.message}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {/* Meta Information */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {item.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{item.author}</span>
                  </div>
                )}
                {item.read_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.read_time} min read</span>
                  </div>
                )}
                <span>{getTimeAgo(item.created_time)}</span>
              </div>

              {/* Read More Button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="w-fit px-0 h-auto text-primary hover:text-primary/80 group/button"
              >
                <span className="mr-1">Read More</span>
                <ArrowRight className="h-3 w-3 group-hover/button:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard card layout
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer",
        isMobilePortrait ? "h-full" : "aspect-[4/3]"
      )}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Image Section */}
      <div className="relative">
        <div className={cn("bg-gradient-to-br from-muted/40 to-muted/20", isMobilePortrait ? "aspect-[16/9]" : "aspect-[16/10]")}>
          {item.picture ? (
            <img
              src={item.picture}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground/30">
              {newsApi.getCategoryIcon(item.category)}
            </div>
          )}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn("text-xs font-medium", newsApi.getCategoryColor(item.category))}>
            {newsApi.getCategoryIcon(item.category)} {item.type || item.category}
          </Badge>
        </div>

        {/* External Link Icon */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-background/80 backdrop-blur-sm rounded-full p-1.5">
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={cn("p-4 flex flex-col justify-between h-full", isMobilePortrait ? "min-h-[120px]" : "")}>
        <div className="space-y-2">
          <h4 className={cn("font-bold leading-tight group-hover:text-primary transition-colors duration-200", isMobilePortrait ? "text-sm line-clamp-2" : "text-base line-clamp-2")}>
            {item.title}
          </h4>
          
          {!isMobilePortrait && (
            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
              {item.description || item.message}
            </p>
          )}
        </div>

        {/* Meta Information */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {item.read_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{item.read_time}m</span>
              </div>
            )}
            <span>{getTimeAgo(item.created_time)}</span>
          </div>
          
          <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};

export default EnhancedNewsCard;
