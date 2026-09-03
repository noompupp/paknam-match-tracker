/**
 * Types for the "Guess the Member" face game.
 *
 * The game reads from the season roster (players / rosters / seasons) and asks
 * the user to identify a club member from cropped parts of their profile photo.
 */

/** A facial region the game can reveal. */
export type FacePart = "eyes" | "nose" | "mouth" | "full";

/** Normalised crop rectangle, expressed as fractions (0..1) of the source image. */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where a set of crop rectangles came from. */
export type CropSource = "detected" | "heuristic";

/** Crop rectangles for every part of one photo. */
export interface FaceRegions {
  photoUrl: string;
  source: CropSource;
  eyes: CropRect;
  nose: CropRect;
  mouth: CropRect;
  full: CropRect;
}

/** One roster member the game can ask about. */
export interface GamePlayer {
  id: string;
  /** Name shown to the user and accepted as the correct answer. */
  displayName: string;
  fullName: string | null;
  nickname: string | null;
  photoUrl: string | null;
  jerseyNumber: string | null;
  position: string | null;
  teamName: string | null;
  teamColor: string | null;
}

export type GameLevel = 1 | 2 | 3 | 4 | 5;

/** Static configuration for one difficulty level. */
export interface LevelConfig {
  level: GameLevel;
  /** Thai title shown on the level card. */
  title: string;
  titleEn: string;
  /** Short description of what the player sees. */
  hint: string;
  hintEn: string;
  /** 1..5 stars. */
  stars: number;
  /**
   * Parts visible at each reveal stage. Index 0 is the starting state; each
   * extra reveal moves one stage further. The final stage is always the
   * complete photo.
   */
  stages: FacePart[][];
  /** Number of multiple-choice options, or null when the answer is typed. */
  choiceCount: number | null;
  /** Base points for answering at stage 0. */
  basePoints: number;
}

/** One question in a round. */
export interface GameQuestion {
  player: GamePlayer;
  /** Multiple-choice options (already shuffled). Empty for typed levels. */
  choices: GamePlayer[];
}

/** The player's result for a single question. */
export interface QuestionResult {
  playerId: string;
  correct: boolean;
  /** Reveal stage the answer was given at (0 = nothing extra revealed). */
  stageUsed: number;
  points: number;
}

export interface RoundSummary {
  level: GameLevel;
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  /** 0..3 stars awarded for the round. */
  stars: number;
  results: QuestionResult[];
}

export interface HighScoreEntry {
  score: number;
  correctCount: number;
  totalQuestions: number;
  stars: number;
  achievedAt: string;
}
