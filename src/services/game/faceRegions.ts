import type { CropRect, FaceRegions } from "./guessGameTypes";

/**
 * Crop geometry for the face game.
 *
 * Every rectangle is normalised (0..1) against the source image, so the UI can
 * render a crop with plain CSS background positioning. That matters: the photos
 * are served from an external host, so a canvas-based crop would be blocked
 * whenever the host does not send CORS headers.
 *
 * Rectangles come from one of two places — real landmark detection, or the
 * portrait heuristic below that assumes a roughly centred head. Detection
 * results are cached so a photo is only ever analysed once per browser.
 */

const CACHE_KEY = "paknam_game_face_regions_v1";
const CACHE_LIMIT = 200;

export const clampRect = (rect: CropRect): CropRect => {
  const width = Math.min(Math.max(rect.width, 0.02), 1);
  const height = Math.min(Math.max(rect.height, 0.02), 1);
  const x = Math.min(Math.max(rect.x, 0), 1 - width);
  const y = Math.min(Math.max(rect.y, 0), 1 - height);
  return { x, y, width, height };
};

/** Grow a rectangle by a fraction of its own size, keeping it inside the image. */
export const padRect = (rect: CropRect, padX: number, padY = padX): CropRect =>
  clampRect({
    x: rect.x - rect.width * padX,
    y: rect.y - rect.height * padY,
    width: rect.width * (1 + padX * 2),
    height: rect.height * (1 + padY * 2),
  });

/**
 * Grow a rectangle about its centre so it is at least `minWidth` x `minHeight`.
 *
 * Landmark boxes for a single feature can be a tiny fraction of the photo. Blown
 * up to fill the screen they turn into unreadable mush, so each feature is held
 * to a sensible minimum relative to the detected face.
 */
export const ensureMinSize = (
  rect: CropRect,
  minWidth: number,
  minHeight: number
): CropRect => {
  const width = Math.max(rect.width, minWidth);
  const height = Math.max(rect.height, minHeight);
  return clampRect({
    x: rect.x + rect.width / 2 - width / 2,
    y: rect.y + rect.height / 2 - height / 2,
    width,
    height,
  });
};

/** Bounding box of a set of normalised points. */
export const boundingBox = (points: { x: number; y: number }[]): CropRect => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return clampRect({
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  });
};

/**
 * Assumed face box for a club profile photo: head centred horizontally and
 * sitting in the upper half of the frame.
 */
const ASSUMED_FACE: CropRect = { x: 0.26, y: 0.1, width: 0.48, height: 0.5 };

const partOfFace = (
  face: CropRect,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number
): CropRect =>
  clampRect({
    x: face.x + face.width * offsetX,
    y: face.y + face.height * offsetY,
    width: face.width * width,
    height: face.height * height,
  });

/** Derive eye / nose / mouth crops from a face box using facial proportions. */
export const regionsFromFaceBox = (
  photoUrl: string,
  face: CropRect,
  source: FaceRegions["source"]
): FaceRegions => ({
  photoUrl,
  source,
  eyes: partOfFace(face, 0.02, 0.28, 0.96, 0.22),
  nose: partOfFace(face, 0.27, 0.44, 0.46, 0.28),
  mouth: partOfFace(face, 0.2, 0.66, 0.6, 0.24),
  // The reveal ends on the whole photo, not just the face.
  full: { x: 0, y: 0, width: 1, height: 1 },
});

/** Fallback crops used before (or instead of) landmark detection. */
export const heuristicRegions = (photoUrl: string): FaceRegions =>
  regionsFromFaceBox(photoUrl, ASSUMED_FACE, "heuristic");

type RegionCache = Record<string, FaceRegions>;

const readCache = (): RegionCache => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as RegionCache) : {};
  } catch {
    return {};
  }
};

export const getCachedRegions = (photoUrl: string): FaceRegions | null =>
  readCache()[photoUrl] ?? null;

export const cacheRegions = (regions: FaceRegions): void => {
  if (typeof window === "undefined") return;
  try {
    const cache = readCache();
    cache[regions.photoUrl] = regions;

    const keys = Object.keys(cache);
    if (keys.length > CACHE_LIMIT) {
      for (const key of keys.slice(0, keys.length - CACHE_LIMIT)) {
        delete cache[key];
      }
    }

    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* a full or unavailable localStorage must not break the game */
  }
};
