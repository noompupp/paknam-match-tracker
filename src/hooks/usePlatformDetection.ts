
import { useState, useEffect } from "react";

export interface PlatformInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isStandalone: boolean;
}

export const usePlatformDetection = (): PlatformInfo => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isStandalone: false,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    console.log('Platform detection - User Agent:', userAgent);
    
    // Enhanced mobile detection
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent) ||
                     window.innerWidth <= 768;
    
    // Enhanced platform detection
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    
    // Enhanced browser detection
    const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent) && !/crios/i.test(userAgent);
    const isChrome = /chrome/i.test(userAgent) || /crios/i.test(userAgent);
    
    // Enhanced PWA detection
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://');

    const detectedInfo = {
      isMobile,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isStandalone,
    };

    console.log('Platform detection results:', detectedInfo);
    
    setPlatformInfo(detectedInfo);
  }, []);

  return platformInfo;
};
