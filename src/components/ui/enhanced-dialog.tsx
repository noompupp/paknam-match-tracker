import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

const EnhancedDialog = DialogPrimitive.Root

const EnhancedDialogTrigger = DialogPrimitive.Trigger

const EnhancedDialogPortal = DialogPrimitive.Portal

const EnhancedDialogClose = DialogPrimitive.Close

const EnhancedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
EnhancedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const EnhancedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean;
    enableMaximize?: boolean;
  }
>(({ className, children, hideCloseButton = false, enableMaximize = false, ...props }, ref) => {
  const [isMaximized, setIsMaximized] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMaximize = () => {
    if (!isMobile) {
      setIsMaximized(!isMaximized);
    }
  };

  return (
    <EnhancedDialogPortal>
      <EnhancedDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 grid gap-4 bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // Apply base styling first (including custom className)
          !isMaximized && [
            // Normal mode styling
            "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            // Mobile sizing
            "h-[90vh] w-[95vw] mobile-safe-modal pb-[15vh]",
            // Desktop sizing 
            "sm:h-auto sm:w-auto sm:max-w-4xl sm:max-h-[90vh] sm:pt-0 sm:pb-0 sm:rounded-lg"
          ],
          // Border and base styles
          "border-0 sm:border",
          // Apply custom className from props
          className,
          // Apply maximized styles LAST so they override everything
          isMaximized && !isMobile && [
            "!inset-2 !max-w-none !max-h-none !w-auto !h-auto !translate-x-0 !translate-y-0 !rounded-lg",
            "!left-auto !top-auto !pb-0 !pt-0",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          ]
        )}
        {...props}
      >
        {children}
        {/* Action buttons container */}
        {(!hideCloseButton || (enableMaximize && !isMobile)) && (
          <div className={cn(
            "absolute z-10 flex items-center gap-1",
            "mobile-modal-close sm:right-4 sm:top-4"
          )}>
            {/* Maximize/Minimize button - desktop only */}
            {enableMaximize && !isMobile && (
              <button
                onClick={toggleMaximize}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1"
                aria-label={isMaximized ? "Minimize window" : "Maximize window"}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            )}
            
            {/* Close button */}
            {!hideCloseButton && (
              <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}
          </div>
        )}
      </DialogPrimitive.Content>
    </EnhancedDialogPortal>
  )
})
EnhancedDialogContent.displayName = DialogPrimitive.Content.displayName

const EnhancedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
EnhancedDialogHeader.displayName = "EnhancedDialogHeader"

const EnhancedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
EnhancedDialogFooter.displayName = "EnhancedDialogFooter"

const EnhancedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
EnhancedDialogTitle.displayName = DialogPrimitive.Title.displayName

const EnhancedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EnhancedDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  EnhancedDialog,
  EnhancedDialogPortal,
  EnhancedDialogOverlay,
  EnhancedDialogClose,
  EnhancedDialogTrigger,
  EnhancedDialogContent,
  EnhancedDialogHeader,
  EnhancedDialogFooter,
  EnhancedDialogTitle,
  EnhancedDialogDescription,
}
