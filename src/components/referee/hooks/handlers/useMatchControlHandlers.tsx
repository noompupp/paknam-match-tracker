
import { useToast } from "@/hooks/use-toast";

interface UseMatchControlHandlersProps {
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  toggleTimer: () => void;
  resetTimer: () => void;
  resetScore: () => void;
  resetEvents: () => void;
  resetCards: () => void;
  resetTracking: () => void;
  resetGoals: () => void;
  addEvent: (type: string, description: string, time: number) => void;
}

export const useMatchControlHandlers = (props: UseMatchControlHandlersProps) => {
  const handleToggleTimer = () => {
    props.toggleTimer();
    const action = props.isRunning ? 'paused' : 'started';
    props.addEvent('Timer', `Match timer ${action} at ${props.formatTime(props.matchTime)}`, props.matchTime);
  };

  const handleResetMatch = () => {
    props.resetTimer();
    props.resetScore();
    props.resetEvents();
    props.resetCards();
    props.resetTracking();
    props.resetGoals();
    props.addEvent('Reset', 'Match reset', 0);
  };

  return {
    handleToggleTimer,
    handleResetMatch
  };
};
