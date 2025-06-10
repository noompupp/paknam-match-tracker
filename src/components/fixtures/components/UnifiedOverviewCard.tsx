
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UnifiedOverviewCardProps {
  title: string;
  variant: 'primary' | 'secondary';
  stats: Array<{
    value: number;
    label: string;
    color?: string;
  }>;
  className?: string;
}

const UnifiedOverviewCard = ({ title, variant, stats, className }: UnifiedOverviewCardProps) => {
  const variantStyles = {
    primary: "bg-gradient-to-r from-primary/5 to-transparent border-primary/20 hover:border-primary/30",
    secondary: "bg-gradient-to-l from-secondary/5 to-transparent border-secondary/20 hover:border-secondary/30"
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md w-full",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg truncate text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className={cn(
                "text-2xl font-bold",
                stat.color || (variant === 'primary' ? 'text-primary' : 'text-secondary')
              )}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedOverviewCard;
