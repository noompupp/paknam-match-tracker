
import { useEffect } from "react";
import { PlayerTime } from "@/types/database";
import { isSecondHalf } from "@/utils/timeUtils";

export const useTimeUpdater = (
  isTimerRunning: boolean,
  trackedPlayers: PlayerTime[],
  setTrackedPlayers: React.Dispatch<React.SetStateAction<PlayerTime[]>>,
  setPlayerHalfTimes: React.Dispatch<React.SetStateAction<Map<number, { firstHalf: number; secondHalf: number }>>>,
  matchTime: number // Add matchTime parameter to know which half we're in
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

        // Update half times tracking based on current match time
        setPlayerHalfTimes(prev => {
          const newMap = new Map(prev);
          trackedPlayers.forEach(player => {
            if (player.isPlaying) {
              const halfTimes = newMap.get(player.id) || { firstHalf: 0, secondHalf: 0 };
              const currentHalf = isSecondHalf(matchTime) ? 2 : 1;
              
              if (currentHalf === 1) {
                halfTimes.firstHalf += 1;
              } else {
                halfTimes.secondHalf += 1;
              }
              
              newMap.set(player.id, halfTimes);
              
              console.log('⏱️ Updated half times for', player.name, ':', {
                currentHalf,
                firstHalf: `${Math.floor(halfTimes.firstHalf / 60)}:${String(halfTimes.firstHalf % 60).padStart(2, '0')}`,
                secondHalf: `${Math.floor(halfTimes.secondHalf / 60)}:${String(halfTimes.secondHalf % 60).padStart(2, '0')}`,
                totalTime: `${Math.floor((player.totalTime + 1) / 60)}:${String((player.totalTime + 1) % 60).padStart(2, '0')}`,
                matchTime: `${Math.floor(matchTime / 60)}:${String(matchTime % 60).padStart(2, '0')}`
              });
            }
          });
          return newMap;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTimerRunning, trackedPlayers, setTrackedPlayers, setPlayerHalfTimes, matchTime]);
};
