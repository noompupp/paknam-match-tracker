
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MobileTeamName from "./MobileTeamName";

interface UnifiedOverviewCardProps {
  title: string;
  variant: 'primary' | 'secondary';
  stats: Array<{
    value: number;
    label: string;
    color?: string;
  }>;
  className?: string;
  teamName?: string;
}

const UnifiedOverviewCard = ({ title, variant, stats, className, teamName }: UnifiedOverviewCardProps) => {
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
        <CardTitle className="text-lg text-foreground">
          {teamName ? (
            <MobileTeamName teamName={teamName} />
          ) : (
            <span className="truncate">{title}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="min-w-0">
              <p className={cn(
                "text-xl sm:text-2xl font-bold truncate",
                stat.color || (variant === 'primary' ? 'text-primary' : 'text-secondary')
              )}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedOverviewCard;
