
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
        return 'time-badge-goal-gradient text-green-800 dark:text-green-200';
      case 'yellow':
        return 'time-badge-card-gradient text-yellow-800 dark:text-yellow-200';
      case 'red':
        return 'time-badge-red-gradient text-red-800 dark:text-red-200';
      case 'card':
        return 'time-badge-card-gradient text-orange-800 dark:text-orange-200';
      default:
        return 'time-badge-gradient text-foreground';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`text-sm font-mono font-semibold premier-card-shadow ${getVariantStyles()} ${className}`}
    >
      {time}
    </Badge>
  );
};

export default EnhancedTimeBadge;
