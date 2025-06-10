
import { useState } from "react";

export const usePlayerAvatarState = (autoFlip: boolean = false, disabled: boolean = false) => {
  const [isFlipped, setIsFlipped] = useState(autoFlip);

  const handleAvatarClick = () => {
    if (disabled) return;
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  return {
    isFlipped,
    setIsFlipped,
    handleAvatarClick,
    handleKeyDown
  };
};
