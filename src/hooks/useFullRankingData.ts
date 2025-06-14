
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

// Normalizes a name/team string for robust matching
const normalize = (value: any) =>
  (typeof value === "string" ? value.trim().toLowerCase() : "");

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

  let filteredData: any[] = [];

  if (allScorers && allMembers) {
    filteredData = allScorers
      .filter(player => player.goals >= 1)
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return a.name.localeCompare(b.name);
      })
      .map(statPlayer => {
        // Find enriched profile using normalized names & teams
        const statPlayerName = normalize(statPlayer.name);
        const statPlayerTeam = normalize(statPlayer.team);

        let profile =
          allMembers.find(
            (p: any) =>
              normalize(p.name) === statPlayerName &&
              (statPlayerTeam
                ? normalize(p.team?.name) === statPlayerTeam
                : true)
          ) ||
          // fallback: match only on normalized name
          allMembers.find((p: any) => normalize(p.name) === statPlayerName);

        // Always extract profile data if available
        const id = profile?.id ?? undefined;
        const profileImageUrl = extractProfileImageUrl(profile);
        const team = profile?.team?.name || statPlayer.team;

        // Diagnostic logging (can be disabled later)
        if (!profileImageUrl) {
          console.warn("[Enrichment/Avatar] No image found for scorer:", { statPlayer, profile });
        }

        return {
          ...statPlayer,
          id,
          profileImageUrl,
          team,
        };
      });

    // LOG enriched data for debugging
    console.log("[Enrichment/FilteredScorers FINAL DATA]", filteredData.map(x => ({
      name: x.name, team: x.team, id: x.id, profileImageUrl: x.profileImageUrl
    })));
  }

  return {
    data: filteredData,
    isLoading: isLoading || loadingMembers,
    error,
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
        // Find enriched profile using normalized names & teams
        const statPlayerName = normalize(statPlayer.name);
        const statPlayerTeam = normalize(statPlayer.team);

        let profile =
          allMembers.find(
            (p: any) =>
              normalize(p.name) === statPlayerName &&
              (statPlayerTeam
                ? normalize(p.team?.name) === statPlayerTeam
                : true)
          ) ||
          // fallback: match only on normalized name
          allMembers.find((p: any) => normalize(p.name) === statPlayerName);

        // Always extract profile data if available
        const id = profile?.id ?? undefined;
        const profileImageUrl = extractProfileImageUrl(profile);
        const team = profile?.team?.name || statPlayer.team;

        // Diagnostic logging (can be disabled later)
        if (!profileImageUrl) {
          console.warn("[Enrichment/Avatar] No image found for assist:", { statPlayer, profile });
        }

        return {
          ...statPlayer,
          id,
          profileImageUrl,
          team,
        };
      });
    // LOG enriched data for debugging
    console.log("[Enrichment/FilteredAssists FINAL DATA]", filteredData.map(x => ({
      name: x.name, team: x.team, id: x.id, profileImageUrl: x.profileImageUrl
    })));
  }

  return {
    data: filteredData,
    isLoading: isLoading || loadingMembers,
    error,
  };
};
