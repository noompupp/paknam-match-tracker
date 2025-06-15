
interface MatchSaveResultData {
  message: string;
  errors?: string[];
  data?: {
    scoreUpdated?: boolean;
    goalsAssigned?: number;
    cardsCreated?: number;
    playerTimesUpdated?: number;
  };
}

/**
 * Returns a user-friendly, emoji-rich, multi-line toast message about match save results.
 */
export function formatMatchSaveSuccessMessage(result: MatchSaveResultData, homeTeamName: string, homeScore: number, awayTeamName: string, awayScore: number) {
  const { errors = [], data = {} } = result;
  const isPartial = !!(errors.length);
  // Use meaningful defaults
  const goals = data.goalsAssigned ?? 0;
  const cards = data.cardsCreated ?? 0;
  const tracked = data.playerTimesUpdated ?? 0;
  const score = `🏆 Final score: ${homeTeamName} ${homeScore} - ${awayScore} ${awayTeamName}`;

  // Always show final score on top
  let description = `${score}\n\n`;

  if (!isPartial) {
    const bulletLines = [
      goals > 0 ? `• ⚽ ${goals} goal${goals !== 1 ? "s" : ""} / assist${goals !== 1 ? "s" : ""} assigned` : undefined,
      cards > 0 ? `• 🟨🟥 ${cards} card${cards !== 1 ? "s" : ""} created` : undefined,
      tracked > 0 ? `• ⏱️ ${tracked} player${tracked !== 1 ? "s" : ""} with tracked time` : undefined,
      data.scoreUpdated ? "• 📈 Score updated in database" : undefined,
    ].filter(Boolean);
    if (bulletLines.length) description += bulletLines.join('\n') + '\n';

    description += "\nAll match data saved successfully! 🎉";
  } else {
    // Partial Save: show issues and some success stats if available
    description += "Some data could not be saved:\n";
    description += errors.map(e => `❌ ${e}`).join('\n');
    const atLeast = (goals || cards || tracked) > 0;
    if (atLeast) {
      description += "\n\nPartial saves:\n";
      if (goals > 0) description += `• ⚽ ${goals} goal${goals !== 1 ? "s" : ""}\n`;
      if (cards > 0) description += `• 🟨🟥 ${cards} card${cards !== 1 ? "s" : ""}\n`;
      if (tracked > 0) description += `• ⏱️ ${tracked} player${tracked !== 1 ? "s" : ""} tracked\n`;
    }
    description += '\nCheck event logs or contact support if you keep having trouble!';
  }
  return description.trim();
}
