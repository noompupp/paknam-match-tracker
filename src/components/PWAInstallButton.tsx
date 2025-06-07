
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
      
      return isStandalone || isInWebAppiOS || isInWebAppChrome;
    };

    setIsInstalled(checkIfInstalled());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install button only if not already installed
      if (!checkIfInstalled()) {
        setShowInstallButton(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA install accepted');
        setShowInstallButton(false);
      } else {
        console.log('PWA install dismissed');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during PWA install:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    // Hide for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed, dismissed this session, or no prompt available
  if (isInstalled || !showInstallButton || !deferredPrompt) {
    return null;
  }

  // Don't show if user dismissed it this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="pwa-install-button group">
      <Button
        onClick={handleInstallClick}
        size="sm"
        className="w-full h-full rounded-full bg-primary/90 hover:bg-primary text-primary-foreground border-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-105"
      >
        <Download className="h-5 w-5" />
        <span className="sr-only">Install App</span>
      </Button>
      
      <Button
        onClick={handleDismiss}
        size="sm"
        variant="ghost"
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-gray-600 p-0 shadow-sm"
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
};

export default PWAInstallButton;
