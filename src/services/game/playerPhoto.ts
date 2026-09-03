import { fetchCurrentSeasonId, fetchSeasonRoster } from "./guessGameRoster";
import type { GamePlayer } from "./guessGameTypes";

/**
 * Profile-photo loading helpers for the guess-the-member game.
 *
 * Photos live on an external host, so two things matter here:
 *  - the URL is upgraded to https when the app itself is served over https,
 *    otherwise the browser blocks it as mixed content;
 *  - images are cached per URL, because a round shows the same photo across
 *    several reveal stages and face detection wants the same element again.
 */

/** Upgrade bare-http photo URLs so they are not blocked on an https page. */
export const normalizePhotoUrl = (url: string): string => {
  if (!url) return url;
  const isSecurePage =
    typeof window !== "undefined" && window.location.protocol === "https:";
  if (isSecurePage && url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`;
  }
  return url;
};

const imageCache = new Map<string, Promise<HTMLImageElement>>();

interface LoadImageOptions {
  /**
   * Request the image with CORS so its pixels can be read from a canvas.
   * Only face detection needs this; plain display does not.
   */
  cors?: boolean;
}

/**
 * Load an image element for a photo URL, reusing an in-flight or completed load.
 *
 * CORS and non-CORS loads are cached separately: a CORS request can fail on a
 * host that serves the image perfectly well without one.
 */
export const loadImage = (
  url: string,
  { cors = false }: LoadImageOptions = {}
): Promise<HTMLImageElement> => {
  const src = normalizePhotoUrl(url);
  const cacheKey = `${cors ? "cors" : "plain"}:${src}`;

  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load photo: ${src}`));
    img.src = src;
  });

  // Don't cache failures, so a transient network error can be retried.
  promise.catch(() => imageCache.delete(cacheKey));
  imageCache.set(cacheKey, promise);
  return promise;
};

/** Warm the browser cache for upcoming questions. Never rejects. */
export const preloadPhotos = (urls: (string | null | undefined)[]): void => {
  for (const url of urls) {
    if (!url) continue;
    loadImage(url).catch(() => {
      /* preloading is best-effort */
    });
  }
};

const matchesName = (player: GamePlayer, name: string): boolean => {
  const needle = name.trim().toLocaleLowerCase();
  if (!needle) return false;
  return [player.displayName, player.nickname, player.fullName].some(
    (candidate) => candidate?.trim().toLocaleLowerCase() === needle
  );
};

/**
 * Look up a member's profile photo by name within a season.
 *
 * @param name     Display name, nickname or full name of the member.
 * @param seasonId Season to search; defaults to the current season.
 * @returns The photo URL, or null when the member has no photo on file.
 */
export const loadPlayerPhoto = async (
  name: string,
  seasonId?: string
): Promise<string | null> => {
  const resolvedSeasonId = seasonId ?? (await fetchCurrentSeasonId());
  if (!resolvedSeasonId) return null;

  const roster = await fetchSeasonRoster(resolvedSeasonId);
  const player = roster.find((p) => matchesName(p, name));
  if (!player?.photoUrl) return null;

  return normalizePhotoUrl(player.photoUrl);
};
