
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
    console.log('PWA Prompt - Platform detection:', { 
      isMobile, 
      isIOS, 
      isAndroid, 
      isSafari, 
      isChrome, 
      isStandalone 
    });

    // Don't show if already installed or not mobile
    if (isStandalone || !isMobile) {
      console.log('PWA Prompt - Not showing: standalone or not mobile');
      return;
    }

    // Don't show if already shown in this session
    if (hasShownPrompt) {
      console.log('PWA Prompt - Already shown this session');
      return;
    }

    // Don't show if user dismissed it in this session
    if (sessionStorage.getItem('pwa-prompt-dismissed')) {
      console.log('PWA Prompt - User dismissed in session');
      return;
    }

    // Check if we should show the prompt based on platform
    const shouldShow = (isIOS && isSafari) || (isAndroid && isChrome) || 
                      (!isIOS && !isAndroid && isMobile);

    if (!shouldShow) {
      console.log('PWA Prompt - Platform not supported for prompt');
      return;
    }

    console.log('PWA Prompt - Scheduling prompt to show in 5 seconds');

    // Show prompt after 5 seconds (reduced from 8 for testing)
    const timer = setTimeout(() => {
      console.log('PWA Prompt - Showing prompt now');
      showPWAPrompt();
      setHasShownPrompt(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isMobile, isStandalone, hasShownPrompt, isIOS, isAndroid, isSafari, isChrome]);

  const showPWAPrompt = () => {
    const getPromptContent = () => {
      if (isIOS && isSafari) {
        return {
          title: "Add to Home Screen",
          description: "Install this app on your iPhone: tap Share then 'Add to Home Screen'",
          icon: Share,
          instructions: "Tap the Share button below and select 'Add to Home Screen'"
        };
      } else if (isAndroid && isChrome) {
        return {
          title: "Install App",
          description: "Add Paknam FC to your home screen for quick access",
          icon: Plus,
          instructions: "Tap 'Add to Home Screen' when prompted"
        };
      } else {
        return {
          title: "Install App",
          description: "Add Paknam FC to your home screen for the best experience",
          icon: Home,
          instructions: "Look for 'Add to Home Screen' in your browser menu"
        };
      }
    };

    const content = getPromptContent();
    const IconComponent = content.icon;

    console.log('PWA Prompt - Showing toast with content:', content);

    toast({
      title: content.title,
      description: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span>{content.description}</span>
          </div>
          <p className="text-xs text-muted-foreground">{content.instructions}</p>
        </div>
      ),
      duration: 15000, // Show for 15 seconds
      action: (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log('PWA Prompt - User dismissed toast');
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
