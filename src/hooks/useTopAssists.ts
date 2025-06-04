
import { useMembers } from './useMembers';

export const useTopAssists = () => {
  const { data: members, isLoading, error } = useMembers();
  
  console.log('🎯 useTopAssists: Raw members data:', members);
  
  const topAssists = members
    ?.filter(member => member.assists && member.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5)
    .map(member => ({
      name: member.name,
      team: member.team?.name || 'Unknown Team',
      assists: member.assists,
    })) || [];

  console.log('🎯 useTopAssists: Computed top assists:', topAssists);

  return {
    data: topAssists,
    isLoading,
    error,
  };
};
