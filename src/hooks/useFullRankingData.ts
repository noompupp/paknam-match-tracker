
import { useQuery } from "@tanstack/react-query";
import { useEnhancedTopScorers, useEnhancedTopAssists } from './useEnhancedPlayerStats';
import { membersApi } from "@/services/api";

// Helper to extract image URL from possible member fields
const extractProfileImageUrl = (profile: any) =>
  profile?.profileImageUrl ||
  profile?.optimized_avatar_url ||
  profile?.profile_picture ||
  profile?.ProfileURL ||
  "";

// Fetch ALL members with full info
const useAllMembersProfiles = () => {
  return useQuery({
    queryKey: ['allMembersFullProfiles'],
    queryFn: async () => {
      // This includes all fields for member avatars, etc
      const members = await membersApi.getAll();
      return members || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFullScorersRanking = () => {
  return useEnhancedTopScorers(100); // Get a large number to capture all players
};

export const useFullAssistsRanking = () => {
  return useEnhancedTopAssists(100); // Get a large number to capture all players
};

// ENRICHED version: joins the stat list with member profiles for full avatars
export const useFilteredScorersRanking = () => {
  const { data: allScorers, isLoading, error } = useFullScorersRanking();
  const { data: allMembers, isLoading: loadingMembers } = useAllMembersProfiles();

  // Map stat ranking -> join with member by name or id, merge full profile & stat info
  let filteredData: any[] = [];

  if (allScorers) {
    filteredData = allScorers
      .filter(player => player.goals >= 1)
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return a.name.localeCompare(b.name);
      })
      .map(statPlayer => {
        // Try to match by id (number or string), fall back to name (for cases where id might not exist)
        const profile = allMembers?.find(
          p => (String(p.id) === String(statPlayer.id)) || (p.name === statPlayer.name)
        );
        return {
          ...statPlayer,
          profileImageUrl: extractProfileImageUrl(profile),
          team: profile?.team?.name || statPlayer.team,
          // add any more from profile if needed!
        };
      });
  }

  return {
    data: filteredData,
    isLoading: isLoading || loadingMembers,
    error
  };
};

export const useFilteredAssistsRanking = () => {
  const { data: allAssists, isLoading, error } = useFullAssistsRanking();
  const { data: allMembers, isLoading: loadingMembers } = useAllMembersProfiles();

  let filteredData: any[] = [];

  if (allAssists) {
    filteredData = allAssists
      .filter(player => player.assists >= 1)
      .sort((a, b) => {
        if (b.assists !== a.assists) return b.assists - a.assists;
        return a.name.localeCompare(b.name);
      })
      .map(statPlayer => {
        // Try to match by id (number or string), fall back to name
        const profile = allMembers?.find(
          p => (String(p.id) === String(statPlayer.id)) || (p.name === statPlayer.name)
        );
        return {
          ...statPlayer,
          profileImageUrl: extractProfileImageUrl(profile),
          team: profile?.team?.name || statPlayer.team,
        };
      });
  }

  return {
    data: filteredData,
    isLoading: isLoading || loadingMembers,
    error
  };
};
