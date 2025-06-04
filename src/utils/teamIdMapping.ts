
/**
 * Utility functions for mapping between text team IDs and numeric team IDs
 */

export const getNumericTeamId = (textTeamId: string, teams: any[]): number => {
  const team = teams?.find(t => t.__id__ === textTeamId || t.name === textTeamId);
  if (!team) {
    throw new Error(`Cannot find numeric team ID for text ID: ${textTeamId}`);
  }
  return team.id;
};

export const getTextTeamId = (numericTeamId: number, teams: any[]): string => {
  const team = teams?.find(t => t.id === numericTeamId);
  if (!team) {
    throw new Error(`Cannot find text team ID for numeric ID: ${numericTeamId}`);
  }
  return team.__id__ || team.name;
};

export const resolveTeamIdForMatchEvent = (
  playerTeamName: string,
  homeTeam: { id: number; name: string },
  awayTeam: { id: number; name: string }
): number => {
  if (playerTeamName === homeTeam.name) {
    return homeTeam.id;
  } else if (playerTeamName === awayTeam.name) {
    return awayTeam.id;
  } else {
    throw new Error(`Cannot resolve team ID for player team: ${playerTeamName}. Available teams: ${homeTeam.name}, ${awayTeam.name}`);
  }
};
