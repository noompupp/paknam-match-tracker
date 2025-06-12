
import { useCallback, useEffect } from 'react';
import { PlayerTime } from '@/types/database';

interface PersistenceConfig {
  storageKey: string;
  autoSaveInterval: number; // milliseconds
  maxStorageAge: number; // milliseconds
}

export const usePersistenceManager = (config: PersistenceConfig = {
  storageKey: 'refereeTools_playerTimes',
  autoSaveInterval: 10000, // 10 seconds
  maxStorageAge: 86400000 // 24 hours
}) => {
  const saveToLocalStorage = useCallback((
    fixtureId: number,
    playerTimes: PlayerTime[]
  ) => {
    try {
      const storageData = {
        fixtureId,
        playerTimes,
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorage.setItem(
        `${config.storageKey}_${fixtureId}`,
        JSON.stringify(storageData)
      );

      console.log('💾 Persistence: Saved', playerTimes.length, 'player times to localStorage');
    } catch (error) {
      console.error('❌ Persistence: Failed to save to localStorage:', error);
    }
  }, [config.storageKey]);

  const loadFromLocalStorage = useCallback((
    fixtureId: number
  ): PlayerTime[] => {
    try {
      const storedData = localStorage.getItem(`${config.storageKey}_${fixtureId}`);
      
      if (!storedData) {
        console.log('ℹ️ Persistence: No stored data found for fixture', fixtureId);
        return [];
      }

      const parsedData = JSON.parse(storedData);
      
      // Check if data is not too old
      const age = Date.now() - parsedData.timestamp;
      if (age > config.maxStorageAge) {
        console.log('⏰ Persistence: Stored data too old, clearing');
        localStorage.removeItem(`${config.storageKey}_${fixtureId}`);
        return [];
      }

      console.log('📂 Persistence: Loaded', parsedData.playerTimes.length, 'player times from localStorage');
      return parsedData.playerTimes || [];
    } catch (error) {
      console.error('❌ Persistence: Failed to load from localStorage:', error);
      return [];
    }
  }, [config.storageKey, config.maxStorageAge]);

  const clearLocalStorage = useCallback((fixtureId: number) => {
    try {
      localStorage.removeItem(`${config.storageKey}_${fixtureId}`);
      console.log('🗑️ Persistence: Cleared localStorage for fixture', fixtureId);
    } catch (error) {
      console.error('❌ Persistence: Failed to clear localStorage:', error);
    }
  }, [config.storageKey]);

  const getAllStoredFixtures = useCallback((): number[] => {
    try {
      const fixtures: number[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(config.storageKey)) {
          const fixtureId = parseInt(key.split('_').pop() || '0');
          if (fixtureId > 0) fixtures.push(fixtureId);
        }
      }
      return fixtures;
    } catch (error) {
      console.error('❌ Persistence: Failed to get stored fixtures:', error);
      return [];
    }
  }, [config.storageKey]);

  const cleanOldStorage = useCallback(() => {
    try {
      const fixtures = getAllStoredFixtures();
      let cleanedCount = 0;

      fixtures.forEach(fixtureId => {
        const storedData = localStorage.getItem(`${config.storageKey}_${fixtureId}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const age = Date.now() - parsedData.timestamp;
          
          if (age > config.maxStorageAge) {
            localStorage.removeItem(`${config.storageKey}_${fixtureId}`);
            cleanedCount++;
          }
        }
      });

      if (cleanedCount > 0) {
        console.log('🧹 Persistence: Cleaned', cleanedCount, 'old storage entries');
      }
    } catch (error) {
      console.error('❌ Persistence: Failed to clean old storage:', error);
    }
  }, [getAllStoredFixtures, config.storageKey, config.maxStorageAge]);

  // Auto-clean on initialization
  useEffect(() => {
    cleanOldStorage();
  }, [cleanOldStorage]);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    getAllStoredFixtures,
    cleanOldStorage
  };
};
