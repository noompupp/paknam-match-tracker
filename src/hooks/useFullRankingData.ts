
import { useEnhancedTopScorers, useEnhancedTopAssists } from './useEnhancedPlayerStats';

export const useFullScorersRanking = () => {
  return useEnhancedTopScorers(100); // Get a large number to capture all players
};

export const useFullAssistsRanking = () => {
  return useEnhancedTopAssists(100); // Get a large number to capture all players
};

// Ensure filteredData preserves id and profileImageUrl (do not strip fields!)
export const useFilteredScorersRanking = () => {
  const { data: allScorers, isLoading, error } = useFullScorersRanking();
  
  const filteredData = allScorers
    ?.filter(player => player.goals >= 1)
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.name.localeCompare(b.name);
    }) ?? [];

  return {
    data: filteredData,
    isLoading,
    error
  };
};

export const useFilteredAssistsRanking = () => {
  const { data: allAssists, isLoading, error } = useFullAssistsRanking();
  
  const filteredData = allAssists
    ?.filter(player => player.assists >= 1)
    .sort((a, b) => {
      if (b.assists !== a.assists) return b.assists - a.assists;
      return a.name.localeCompare(b.name);
    }) ?? [];

  return {
    data: filteredData,
    isLoading,
    error
  };
};
