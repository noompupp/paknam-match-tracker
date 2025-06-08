
import { useRef, useCallback } from 'react';

export const useIdGenerator = () => {
  const idCounter = useRef(0);
  
  const generateId = useCallback(() => 
    `local_${Date.now()}_${++idCounter.current}`, 
    []
  );

  return generateId;
};
