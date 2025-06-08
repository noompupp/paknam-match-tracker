
import { Badge } from "@/components/ui/badge";

interface EnhancedTimeBadgeProps {
  time: string;
  variant?: 'goal' | 'card' | 'yellow' | 'red' | 'default';
  className?: string;
}

const EnhancedTimeBadge = ({ 
  time, 
  variant = 'default',
  className = "" 
}: EnhancedTimeBadgeProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'goal':
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800';
      case 'yellow':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800';
      case 'red':
        return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800';
      case 'card':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-800';
      default:
        return 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 text-foreground';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`text-xs font-mono font-medium premier-card-shadow ${getVariantStyles()} ${className}`}
    >
      {time}
    </Badge>
  );
};

export default EnhancedTimeBadge;
