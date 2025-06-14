
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

// Use unified normalization for matching
const normalize = (str: string | null | undefined) =>
  typeof str === "string" ? str.trim().toLowerCase() : "";

export const useFilteredScorersRanking = () => {
  const { data: allScorers, isLoading, error } = useFullScorersRanking();
  const { data: allMembers, isLoading: loadingMembers } = useAllMembersProfiles();

  let filteredData: any[] = [];

  if (allScorers && allMembers) {
    filteredData = allScorers
      .filter(player => player.goals >= 1)
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return a.name.localeCompare(b.name);
      })
      .map(statPlayer => {
        // Primary: name+team, fallback: only name
        const statName = normalize(statPlayer.name);
        const statTeam = normalize(statPlayer.team);

        let profile =
          allMembers.find((p: any) =>
            normalize(p.name) === statName &&
            p.team && normalize(p.team.name) === statTeam
          ) ||
          allMembers.find((p: any) => normalize(p.name) === statName);

        return {
          ...statPlayer,
          id: profile?.id ?? undefined,
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

export const useFilteredAssistsRanking = () => {
  const { data: allAssists, isLoading, error } = useFullAssistsRanking();
  const { data: allMembers, isLoading: loadingMembers } = useAllMembersProfiles();

  let filteredData: any[] = [];

  if (allAssists && allMembers) {
    filteredData = allAssists
      .filter(player => player.assists >= 1)
      .sort((a, b) => {
        if (b.assists !== a.assists) return b.assists - a.assists;
        return a.name.localeCompare(b.name);
      })
      .map(statPlayer => {
        const statName = normalize(statPlayer.name);
        const statTeam = normalize(statPlayer.team);

        let profile =
          allMembers.find((p: any) =>
            normalize(p.name) === statName &&
            p.team && normalize(p.team.name) === statTeam
          ) ||
          allMembers.find((p: any) => normalize(p.name) === statName);

        return {
          ...statPlayer,
          id: profile?.id ?? undefined,
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
