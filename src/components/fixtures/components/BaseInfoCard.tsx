
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BaseInfoCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'neutral';
  className?: string;
  contentClassName?: string;
}

const BaseInfoCard = ({ 
  title, 
  icon, 
  children, 
  variant = 'neutral',
  className,
  contentClassName
}: BaseInfoCardProps) => {
  const variantStyles = {
    primary: "bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border-primary/20 hover:border-primary/30",
    secondary: "bg-gradient-to-r from-secondary/8 via-secondary/4 to-transparent border-secondary/20 hover:border-secondary/30",
    neutral: "bg-gradient-to-r from-muted/8 via-muted/4 to-transparent border-border/20 hover:border-border/30"
  };

  const iconStyles = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    secondary: "bg-secondary/10 border-secondary/20 text-secondary", 
    neutral: "bg-muted/10 border-border/20 text-muted-foreground"
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md backdrop-blur-sm",
      variantStyles[variant],
      className
    )}>
      <CardContent className={cn("p-4", contentClassName)}>
        <div className="flex items-start gap-4 text-sm">
          <div className={cn(
            "flex-shrink-0 p-2 rounded-lg border",
            iconStyles[variant]
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              {title}
            </p>
            <div className="text-foreground">
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BaseInfoCard;
