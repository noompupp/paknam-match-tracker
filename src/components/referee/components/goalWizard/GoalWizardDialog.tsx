
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const GoalWizardDialog = DialogPrimitive.Root

const GoalWizardDialogTrigger = DialogPrimitive.Trigger

const GoalWizardDialogPortal = DialogPrimitive.Portal

const GoalWizardDialogClose = DialogPrimitive.Close

const GoalWizardDialogOverlay = React.forwardRef<
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
GoalWizardDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const GoalWizardDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean;
  }
>(({ className, children, hideCloseButton = false, ...props }, ref) => (
  <GoalWizardDialogPortal>
    <GoalWizardDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        // Mobile-first responsive design
        "h-[100dvh] w-full border-0 rounded-none sm:h-auto sm:w-full sm:max-w-lg sm:border sm:rounded-lg",
        // Mobile: full screen with safe areas, Desktop: centered modal
        "p-0 sm:p-6",
        className
      )}
      {...props}
    >
      <div className="flex flex-col h-full sm:h-auto">
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between p-4 sm:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex-1" />
          {!hideCloseButton && (
            <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-auto p-4 sm:p-0">
          {children}
        </div>
      </div>
      
      {/* Desktop close button */}
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 hidden sm:inline-flex rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </GoalWizardDialogPortal>
))
GoalWizardDialogContent.displayName = DialogPrimitive.Content.displayName

const GoalWizardDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left p-4 sm:p-0",
      className
    )}
    {...props}
  />
)
GoalWizardDialogHeader.displayName = "GoalWizardDialogHeader"

const GoalWizardDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-3 sm:flex-row sm:justify-end sm:space-x-2 p-4 sm:p-0 border-t sm:border-0 bg-background/95 sm:bg-transparent",
      className
    )}
    {...props}
  />
)
GoalWizardDialogFooter.displayName = "GoalWizardDialogFooter"

const GoalWizardDialogTitle = React.forwardRef<
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
GoalWizardDialogTitle.displayName = DialogPrimitive.Title.displayName

const GoalWizardDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
GoalWizardDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  GoalWizardDialog,
  GoalWizardDialogPortal,
  GoalWizardDialogOverlay,
  GoalWizardDialogClose,
  GoalWizardDialogTrigger,
  GoalWizardDialogContent,
  GoalWizardDialogHeader,
  GoalWizardDialogFooter,
  GoalWizardDialogTitle,
  GoalWizardDialogDescription,
}
