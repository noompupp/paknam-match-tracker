
import { useQuery } from "@tanstack/react-query";
import { useEnhancedTopScorers, useEnhancedTopAssists } from './useEnhancedPlayerStats';
import { membersApi } from "@/services/api";

// Return the correct property if it exists, blank otherwise
const extractProfileImageUrl = (profile: any): string => {
  if (!profile) return "";
  // Use any available avatar/profile fields (ordered by preference)
  return (
    profile.profileImageUrl ||
    profile.optimized_avatar_url ||
    profile.ProfileURL ||
    profile.profile_picture ||
    ""
  );
};

// Fetch ALL members (with as much info as possible)
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

// Always normalize strings for safe matching
const normalize = (value: any) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

// Return top N scorers (raw from backend)
export const useFullScorersRanking = () => useEnhancedTopScorers(100);

// Return top N assists (raw from backend)
export const useFullAssistsRanking = () => useEnhancedTopAssists(100);

// Generic enrichment logic for profile data
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
      // Try to match by both name and team
      const statName = normalize(player.name);
      const statTeam = normalize(player.team);

      // Find matching profile (first by name/team, fallback to name)
      const matchedProfile =
        allProfiles.find(
          (profile) =>
            normalize(profile.name) === statName &&
            normalize(profile.team?.name) === statTeam
        ) ||
        allProfiles.find((profile) => normalize(profile.name) === statName);

      return {
        ...player,
        id: matchedProfile?.id ?? player.name ?? player.id ?? Math.random().toString(36).slice(2, 9), // always present
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
