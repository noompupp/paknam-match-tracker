
import { useQuery } from "@tanstack/react-query";
import { useEnhancedTopScorers, useEnhancedTopAssists } from './useEnhancedPlayerStats';
import { membersApi } from "@/services/api";

// Utility: Normalize string (robustly handle Unicode, undefined)
const normalized = (str: any): string =>
  typeof str === "string" ? str.trim().toLowerCase() : "";

// Extract correct image URL; fallback to empty string
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

// Hooks for ranking data (top-N, backend)
export const useFullScorersRanking = () => useEnhancedTopScorers(100);
export const useFullAssistsRanking = () => useEnhancedTopAssists(100);

// Robust enrichment logic for player stats
const enrichPlayerStatList = (
  statList: any[] | undefined,
  allProfiles: any[] | undefined,
  statType: "goals" | "assists"
) => {
  if (!statList || !allProfiles) return [];

  // Patch: Always use robust normalization and safe fallbacks
  const enrichedPlayers = statList
    .filter((player) => {
      const value = statType === "goals" ? player.goals : player.assists;
      return Number(value) >= 1;
    })
    .sort((a, b) => {
      const aValue = statType === "goals" ? a.goals : a.assists;
      const bValue = statType === "goals" ? b.goals : b.assists;
      if (bValue !== aValue) return bValue - aValue;
      return a.name.localeCompare(b.name);
    })
    .map((stat, index) => {
      // Find match in allProfiles: name AND team, fallback to just name if no team match
      const profile =
        allProfiles.find(
          (p) =>
            normalized(p.name) === normalized(stat.name) &&
            (!stat.team || normalized(p.team?.name ?? p.team) === normalized(stat.team))
        ) ||
        allProfiles.find((p) => normalized(p.name) === normalized(stat.name));

      return {
        ...stat,
        id: profile?.id ?? `stat-${statType}-${index}`,
        profileImageUrl: extractProfileImageUrl(profile),
        team: profile?.team?.name || profile?.team || stat.team || "",
      };
    });

  // Log the final enriched list for diagnostics
  console.log(`[Ranking Enrichment] Final players enriched [${statType}]:`, enrichedPlayers);

  return enrichedPlayers;
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
