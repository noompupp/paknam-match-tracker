
import { useQuery } from "@tanstack/react-query";
import { useEnhancedTopScorers, useEnhancedTopAssists } from './useEnhancedPlayerStats';
import { membersApi } from "@/services/api";

// Extract correct image URL; fallback to ""
const extractProfileImageUrl = (profile: any): string => {
  if (!profile) return "";
  return (
    profile.profileImageUrl ||
    profile.optimized_avatar_url ||
    profile.ProfileURL ||
    profile.profile_picture ||
    ""
  );
};

// Fetch ALL members/profiles
const useAllMembersProfiles = () => {
  return useQuery({
    queryKey: ['allMembersFullProfiles'],
    queryFn: async () => {
      const members = await membersApi.getAll();
      return members || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Normalize for safe matching
const normalize = (value: any) => typeof value === "string" ? value.trim().toLowerCase() : "";

// Hooks for ranking data (top-N, backend)
export const useFullScorersRanking = () => useEnhancedTopScorers(100);
export const useFullAssistsRanking = () => useEnhancedTopAssists(100);

// Enhanced enrichment: better normalization and propagates image URL
const enrichPlayerStatList = (
  statList: any[] | undefined,
  allProfiles: any[] | undefined,
  statType: "goals" | "assists"
) => {
  if (!statList || !allProfiles) return [];

  return statList
    .filter((player) => {
      const value = statType === "goals" ? player.goals : player.assists;
      return value >= 1;
    })
    .sort((a, b) => {
      const aValue = statType === "goals" ? a.goals : a.assists;
      const bValue = statType === "goals" ? b.goals : b.assists;
      if (bValue !== aValue) return bValue - aValue;
      return a.name.localeCompare(b.name);
    })
    .map((player) => {
      // Use robust normalization for match
      const statNameNorm = normalize(player.name);
      const statTeamNorm = normalize(player.team);

      // Prefer exact name + team match, else fallback to just name
      const matchedProfile =
        allProfiles.find(
          (profile) =>
            normalize(profile.name) === statNameNorm &&
            normalize(profile.team?.name) === statTeamNorm
        ) ||
        allProfiles.find(
          (profile) =>
            normalize(profile.name) === statNameNorm
        );

      // Compose enriched object (always populate profileImageUrl)
      return {
        ...player,
        id: matchedProfile?.id ?? player.name ?? player.id ?? Math.random().toString(36).slice(2, 9),
        profileImageUrl: extractProfileImageUrl(matchedProfile),
        team: matchedProfile?.team?.name || player.team || "",
      };
    });
};

export const useFilteredScorersRanking = () => {
  const { data: allScorers, isLoading, error } = useFullScorersRanking();
  const { data: allMembers, isLoading: membersLoading } = useAllMembersProfiles();

  const enriched = enrichPlayerStatList(allScorers, allMembers, "goals");

  return {
    data: enriched,
    isLoading: isLoading || membersLoading,
    error,
  };
};

export const useFilteredAssistsRanking = () => {
  const { data: allAssists, isLoading, error } = useFullAssistsRanking();
  const { data: allMembers, isLoading: membersLoading } = useAllMembersProfiles();

  const enriched = enrichPlayerStatList(allAssists, allMembers, "assists");

  return {
    data: enriched,
    isLoading: isLoading || membersLoading,
    error,
  };
};
