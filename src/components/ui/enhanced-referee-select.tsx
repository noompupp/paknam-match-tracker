
import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface EnhancedRefereeSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface EnhancedRefereeSelectContentProps {
  children: React.ReactNode
  className?: string
}

export interface EnhancedRefereeSelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
  playerData?: {
    name: string
    team: string
    number: number | string
    position: string
  }
}

const EnhancedRefereeSelect = React.forwardRef<HTMLButtonElement, EnhancedRefereeSelectProps>(
  ({ value, onValueChange, placeholder, children, disabled, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [selectedLabel, setSelectedLabel] = React.useState(placeholder || "Select player...")

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
            "dark:bg-background dark:border-border dark:text-foreground dark:hover:bg-accent",
            open && "ring-2 ring-ring ring-offset-2",
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
          <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-popover text-popover-foreground shadow-lg border border-border rounded-md overflow-hidden animate-in fade-in-0 zoom-in-95">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === EnhancedRefereeSelectContent) {
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
EnhancedRefereeSelect.displayName = "EnhancedRefereeSelect"

const EnhancedRefereeSelectContent = React.forwardRef<HTMLDivElement, EnhancedRefereeSelectContentProps & { onSelect?: (value: string, label: string) => void }>(
  ({ children, className, onSelect, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("max-h-60 overflow-auto py-1 bg-popover", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === EnhancedRefereeSelectItem) {
            return React.cloneElement(child as React.ReactElement<any>, { onSelect })
          }
          return child
        })}
      </div>
    )
  }
)
EnhancedRefereeSelectContent.displayName = "EnhancedRefereeSelectContent"

const EnhancedRefereeSelectItem = React.forwardRef<HTMLDivElement, EnhancedRefereeSelectItemProps & { onSelect?: (value: string, label: string) => void }>(
  ({ value, children, disabled, className, playerData, onSelect, ...props }, ref) => {
    const displayLabel = playerData ? `${playerData.name} (${playerData.team})` : (typeof children === 'string' ? children : value)
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors",
          "dark:hover:bg-accent dark:hover:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={() => !disabled && onSelect?.(value, displayLabel)}
        {...props}
      >
        {playerData ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {playerData.number || '?'}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{playerData.name}</span>
                <span className="text-xs text-muted-foreground">{playerData.team}</span>
              </div>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">
              {playerData.position}
            </Badge>
          </div>
        ) : (
          children
        )}
      </div>
    )
  }
)
EnhancedRefereeSelectItem.displayName = "EnhancedRefereeSelectItem"

export { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem }
