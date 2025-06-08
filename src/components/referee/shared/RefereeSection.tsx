
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface RefereeSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

const RefereeSection = ({
  title,
  description,
  children,
  className,
  spacing = 'normal'
}: RefereeSectionProps) => {
  const spacingClasses = {
    tight: "space-y-3",
    normal: "space-y-4", 
    loose: "space-y-6"
  };

  return (
    <section className={cn(
      "referee-section",
      spacingClasses[spacing],
      className
    )}>
      {(title || description) && (
        <div className="referee-section-header">
          {title && (
            <h3 className="text-xl font-semibold text-foreground mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="referee-section-content">
        {children}
      </div>
    </section>
  );
};

export default RefereeSection;
