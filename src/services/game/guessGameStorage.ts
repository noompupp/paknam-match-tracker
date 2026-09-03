import type { GameLevel, HighScoreEntry, RoundSummary } from "./guessGameTypes";

/**
 * Per-level high scores, kept in localStorage.
 *
 * This is deliberately local-only for now; a shared leaderboard would live in
 * Supabase and needs a table plus a write policy.
 */

const STORAGE_KEY = "paknam_game_high_scores_v1";

type HighScores = Partial<Record<GameLevel, HighScoreEntry>>;

export const readHighScores = (): HighScores => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HighScores) : {};
  } catch {
    return {};
  }
};

export const readHighScore = (level: GameLevel): HighScoreEntry | null =>
  readHighScores()[level] ?? null;

/**
 * Store a round if it beats the level's current best.
 *
 * @returns true when the round set a new record.
 */
export const saveHighScore = (summary: RoundSummary): boolean => {
  if (typeof window === "undefined") return false;

  const scores = readHighScores();
  const previous = scores[summary.level];
  if (previous && previous.score >= summary.score) return false;

  scores[summary.level] = {
    score: summary.score,
    correctCount: summary.correctCount,
    totalQuestions: summary.totalQuestions,
    stars: summary.stars,
    achievedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return true;
  } catch {
    return false;
  }
};
