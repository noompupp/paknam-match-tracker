
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface RefereeLayoutGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  adaptive?: boolean;
}

const RefereeLayoutGrid = ({
  children,
  columns = 2,
  gap = 'md',
  className,
  adaptive = true
}: RefereeLayoutGridProps) => {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6"
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: adaptive ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2",
    3: adaptive ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-3",
    4: adaptive ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-4"
  };

  return (
    <div className={cn(
      "referee-layout-grid grid",
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

export default RefereeLayoutGrid;
