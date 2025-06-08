
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface RefereeCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  variant?: 'default' | 'highlighted' | 'compact';
}

const RefereeCard = ({
  title,
  subtitle,
  icon,
  children,
  className,
  headerActions,
  variant = 'default'
}: RefereeCardProps) => {
  const variants = {
    default: "referee-card",
    highlighted: "referee-card border-primary/20 bg-primary/5 shadow-md dark:bg-primary/3 dark:border-primary/15",
    compact: "referee-card p-4"
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-sm",
      variants[variant],
      className
    )}>
      {(title || headerActions) && variant !== 'compact' && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon && (
                <div className="text-primary">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <CardTitle className="text-lg font-semibold">
                    {title}
                  </CardTitle>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        variant === 'compact' ? "p-0" : "pt-0"
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default RefereeCard;
