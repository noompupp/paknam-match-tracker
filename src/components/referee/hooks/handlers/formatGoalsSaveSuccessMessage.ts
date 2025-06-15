
/**
 * Formats a contextual, emoji-rich message describing saved goals/assists/own goals for the match.
 * Each goal/assist/own goal is shown as a bullet, e.g.:
 *   ⚽ [Player Name] scored for [Team] at [Minute]’
 *   🅰️ Assist by [Player Name]
 *   🎯 Own goal by [Player Name]
 */
type GoalOrAssist = {
  type: "goal" | "assist";
  playerName: string;
  teamName: string;
  time: number;
  isOwnGoal?: boolean;
  assistPlayerName?: string;
};

type FormatGoalsSaveMsgOpts = {
  goals: GoalOrAssist[];
  homeTeamName: string;
  awayTeamName: string;
};

import { roundSecondsUpToMinute } from "@/utils/timeUtils";

/**
 * Returns a user-friendly multiline summary of the saved goals with minimum 1 goal/assist.
 * If no goals, returns a generic fallback.
 * The summary always starts with a "saved successfully" headline.
 */
export function formatGoalsSaveSuccessMessage({ goals, homeTeamName, awayTeamName }: FormatGoalsSaveMsgOpts): string {
  if (!goals || !goals.length) return "✅ Goals saved successfully!";

  const lined = goals.map(goal => {
    if (goal.type === "goal") {
      if (goal.isOwnGoal) {
        return `🎯 Own goal by ${goal.playerName} (${goal.teamName}) at ${roundSecondsUpToMinute(goal.time)}’`;
      } else {
        let base = `⚽ ${goal.playerName} scored for ${goal.teamName} at ${roundSecondsUpToMinute(goal.time)}’`;
        if (goal.assistPlayerName) {
          base += `\n🅰️ Assist by ${goal.assistPlayerName}`;
        }
        return base;
      }
    }
    if (goal.type === "assist") {
      return `🅰️ Assist by ${goal.playerName} for ${goal.teamName} at ${roundSecondsUpToMinute(goal.time)}’`;
    }
    return "";
  });

  return `✅ Goals saved successfully.\n\n${lined.join('\n')}\n\n(Saving goals does not finalize the match.)`;
}
