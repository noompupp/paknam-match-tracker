
import { useEffect, useRef } from 'react';
import { usePlatformDetection } from "@/hooks/usePlatformDetection";

export const useTextOptimization = (itemCount: number) => {
  const { isStandalone } = usePlatformDetection();
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Dynamic text optimization for PWA mode
  useEffect(() => {
    if (isStandalone) {
      textRefs.current.forEach((textElement) => {
        if (textElement) {
          const text = textElement.textContent || '';
          if (text.length > 7) {
            textElement.setAttribute('data-long-text', 'true');
          } else {
            textElement.removeAttribute('data-long-text');
          }
        }
      });
    }
  }, [isStandalone]);

  const setTextRef = (index: number) => (el: HTMLSpanElement | null) => {
    textRefs.current[index] = el;
  };

  return { setTextRef };
};
