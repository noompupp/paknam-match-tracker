
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
    
    // Check if mobile
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Check specific platforms
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    
    // Check browsers
    const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
    const isChrome = /chrome/i.test(userAgent);
    
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

    setPlatformInfo({
      isMobile,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isStandalone,
    });
  }, []);

  return platformInfo;
};
