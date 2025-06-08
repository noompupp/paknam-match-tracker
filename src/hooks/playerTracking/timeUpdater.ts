
import { useEffect } from "react";
import { PlayerTime } from "@/types/database";
import { isSecondHalf } from "@/utils/timeUtils";

export const useTimeUpdater = (
  isTimerRunning: boolean,
  trackedPlayers: PlayerTime[],
  setTrackedPlayers: React.Dispatch<React.SetStateAction<PlayerTime[]>>,
  setPlayerHalfTimes: React.Dispatch<React.SetStateAction<Map<number, { firstHalf: number; secondHalf: number }>>>
) => {
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        setTrackedPlayers(prev => prev.map(player => {
          if (player.isPlaying) {
            const newTotalTime = player.totalTime + 1;
            return { 
              ...player, 
              totalTime: newTotalTime
            };
          }
          return player;
        }));

        // Update half times tracking
        setPlayerHalfTimes(prev => {
          const newMap = new Map(prev);
          trackedPlayers.forEach(player => {
            if (player.isPlaying) {
              const halfTimes = newMap.get(player.id) || { firstHalf: 0, secondHalf: 0 };
              const currentHalf = isSecondHalf(player.totalTime + 1) ? 2 : 1;
              
              if (currentHalf === 1) {
                halfTimes.firstHalf += 1;
              } else {
                halfTimes.secondHalf += 1;
              }
              
              newMap.set(player.id, halfTimes);
            }
          });
          return newMap;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTimerRunning, trackedPlayers, setTrackedPlayers, setPlayerHalfTimes]);
};
