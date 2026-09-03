import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  total?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-8 w-8",
} as const;

const StarRating = ({
  value,
  total = 5,
  className,
  size = "sm",
}: StarRatingProps) => (
  <div
    className={cn("flex items-center gap-0.5", className)}
    role="img"
    aria-label={`${value} จาก ${total} ดาว`}
  >
    {Array.from({ length: total }, (_, index) => (
      <Star
        key={index}
        className={cn(
          sizeClasses[size],
          index < value
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground/30"
        )}
      />
    ))}
  </div>
);

export default StarRating;
