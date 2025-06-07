
import { useState, useEffect } from "react";
import { usePlatformDetection } from "@/hooks/usePlatformDetection";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { X, Share, Plus, Home } from "lucide-react";

const PWAPromptToast = () => {
  const { isMobile, isIOS, isAndroid, isSafari, isChrome, isStandalone } = usePlatformDetection();
  const { toast, dismiss } = useToast();
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed, not mobile, or already shown
    if (isStandalone || !isMobile || hasShownPrompt) {
      return;
    }

    // Don't show if user dismissed it in this session
    if (sessionStorage.getItem('pwa-prompt-dismissed')) {
      return;
    }

    // Show prompt after 8 seconds
    const timer = setTimeout(() => {
      showPWAPrompt();
      setHasShownPrompt(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [isMobile, isStandalone, hasShownPrompt]);

  const showPWAPrompt = () => {
    const getPromptContent = () => {
      if (isIOS && isSafari) {
        return {
          title: "Add to Home Screen",
          description: "Install this app on your iPhone: tap Share then 'Add to Home Screen'",
          icon: <Share className="h-5 w-5" />,
          instructions: "Tap the Share button below and select 'Add to Home Screen'"
        };
      } else if (isAndroid && isChrome) {
        return {
          title: "Install App",
          description: "Add Paknam FC to your home screen for quick access",
          icon: <Plus className="h-5 w-5" />,
          instructions: "Tap 'Add to Home Screen' when prompted"
        };
      } else {
        return {
          title: "Install App",
          description: "Add Paknam FC to your home screen for the best experience",
          icon: <Home className="h-5 w-5" />,
          instructions: "Look for 'Add to Home Screen' in your browser menu"
        };
      }
    };

    const content = getPromptContent();

    toast({
      title: (
        <div className="flex items-center gap-2">
          {content.icon}
          <span>{content.title}</span>
        </div>
      ),
      description: (
        <div className="space-y-2">
          <p>{content.description}</p>
          <p className="text-xs text-muted-foreground">{content.instructions}</p>
        </div>
      ),
      duration: 15000, // Show for 15 seconds
      action: (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            sessionStorage.setItem('pwa-prompt-dismissed', 'true');
            dismiss();
          }}
          className="h-auto p-1"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      ),
    });
  };

  return null; // This component doesn't render anything directly
};

export default PWAPromptToast;
