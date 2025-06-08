
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface RefereeFormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

const RefereeFormField = ({
  label,
  description,
  error,
  required = false,
  children,
  className
}: RefereeFormFieldProps) => {
  return (
    <div className={cn("referee-form-field space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

interface RefereeSelectProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  className?: string;
}

export const RefereeSelect = ({
  placeholder,
  value,
  onValueChange,
  options,
  className
}: RefereeSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn(
        "referee-select h-10 border-input bg-background",
        "focus:border-primary focus:ring-1 focus:ring-primary/20",
        "transition-all duration-200",
        className
      )}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border z-50">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RefereeFormField;
