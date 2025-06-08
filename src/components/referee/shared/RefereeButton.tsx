
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface RefereeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

const RefereeButton = ({
  variant = 'default',
  size = 'default',
  loading = false,
  icon,
  children,
  fullWidth = false,
  className,
  disabled,
  ...props
}: RefereeButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      className={cn(
        "transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        fullWidth && "w-full",
        loading && "cursor-wait",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon && (
          <span className="shrink-0">
            {icon}
          </span>
        )}
        <span className={cn(
          loading && "opacity-70"
        )}>
          {children}
        </span>
      </div>
    </Button>
  );
};

export default RefereeButton;
