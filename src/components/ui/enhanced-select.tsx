
import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EnhancedSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface EnhancedSelectContentProps {
  children: React.ReactNode
  className?: string
}

export interface EnhancedSelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

const EnhancedSelect = React.forwardRef<HTMLButtonElement, EnhancedSelectProps>(
  ({ value, onValueChange, placeholder, children, disabled, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [selectedLabel, setSelectedLabel] = React.useState(placeholder || "Select...")

    const selectRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (itemValue: string, label: string) => {
      onValueChange(itemValue)
      setSelectedLabel(label)
      setOpen(false)
    }

    return (
      <div ref={selectRef} className="relative">
        <button
          ref={ref}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "hover:bg-accent hover:text-accent-foreground transition-colors",
            "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            className
          )}
          onClick={() => !disabled && setOpen(!open)}
          {...props}
        >
          <span className={cn("block truncate", !value && "text-muted-foreground")}>
            {selectedLabel}
          </span>
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
        </button>
        
        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover text-popover-foreground shadow-md border border-border rounded-md overflow-hidden">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === EnhancedSelectContent) {
                return React.cloneElement(child as React.ReactElement<any>, { onSelect: handleSelect })
              }
              return child
            })}
          </div>
        )}
      </div>
    )
  }
)
EnhancedSelect.displayName = "EnhancedSelect"

const EnhancedSelectContent = React.forwardRef<HTMLDivElement, EnhancedSelectContentProps & { onSelect?: (value: string, label: string) => void }>(
  ({ children, className, onSelect, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("max-h-60 overflow-auto py-1", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === EnhancedSelectItem) {
            return React.cloneElement(child as React.ReactElement<any>, { onSelect })
          }
          return child
        })}
      </div>
    )
  }
)
EnhancedSelectContent.displayName = "EnhancedSelectContent"

const EnhancedSelectItem = React.forwardRef<HTMLDivElement, EnhancedSelectItemProps & { onSelect?: (value: string, label: string) => void }>(
  ({ value, children, disabled, className, onSelect, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={() => !disabled && onSelect?.(value, typeof children === 'string' ? children : value)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EnhancedSelectItem.displayName = "EnhancedSelectItem"

export { EnhancedSelect, EnhancedSelectContent, EnhancedSelectItem }
