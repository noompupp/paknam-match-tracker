import {
  boundingBox,
  cacheRegions,
  clampRect,
  ensureMinSize,
  getCachedRegions,
  heuristicRegions,
  padRect,
} from "./faceRegions";
import { loadImage } from "./playerPhoto";
import type { CropRect, FaceRegions } from "./guessGameTypes";

/**
 * Optional landmark detection for the face game.
 *
 * Everything here is a progressive enhancement over the portrait heuristic in
 * faceRegions.ts. The models (~280 kB, the tiny detector plus tiny landmarks)
 * and face-api itself are only fetched the first time a round needs them, and
 * any failure — models missing, no CORS on the photo host, no face found —
 * simply leaves the heuristic crops in place so the game still plays.
 */

/** Served from public/models, so the weights are same-origin. */
const MODEL_URL = "/models";

type FaceApi = typeof import("@vladmandic/face-api");

let faceApiPromise: Promise<FaceApi> | null = null;
let modelsPromise: Promise<FaceApi> | null = null;
/** Set once detection has proven unusable, so we stop retrying every photo. */
let detectionDisabled = false;

const loadFaceApi = (): Promise<FaceApi> => {
  // Dynamic import keeps face-api (and the tfjs it bundles) out of the main chunk.
  faceApiPromise ??= import("@vladmandic/face-api");
  return faceApiPromise;
};

const loadModels = (): Promise<FaceApi> => {
  modelsPromise ??= (async () => {
    const faceapi = await loadFaceApi();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    ]);
    return faceapi;
  })();

  modelsPromise.catch(() => {
    // Allow a later attempt after a transient network failure.
    modelsPromise = null;
  });

  return modelsPromise;
};

/** Whether landmark detection can still be attempted in this session. */
export const isDetectionAvailable = (): boolean => !detectionDisabled;

interface Point {
  x: number;
  y: number;
}

/** Convert pixel-space landmark points to fractions of the image. */
const normalisePoints = (
  points: Point[],
  width: number,
  height: number
): Point[] => points.map((p) => ({ x: p.x / width, y: p.y / height }));

/**
 * Detect eyes, nose and mouth in a photo.
 *
 * @returns Refined regions, or null when detection is unavailable or finds no
 *          face — the caller should keep using the heuristic crops.
 */
export const detectFaceRegions = async (
  photoUrl: string
): Promise<FaceRegions | null> => {
  if (detectionDisabled) return null;

  const cached = getCachedRegions(photoUrl);
  if (cached?.source === "detected") return cached;

  try {
    // Pixel access requires a CORS-enabled load; this rejects if the host
    // does not allow it, which is exactly when we want to fall back.
    const [faceapi, img] = await Promise.all([
      loadModels(),
      loadImage(photoUrl, { cors: true }),
    ]);

    const detection = await faceapi
      .detectSingleFace(
        img,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.35,
        })
      )
      .withFaceLandmarks(true);

    if (!detection) return null;

    const { width, height } = img.naturalWidth
      ? { width: img.naturalWidth, height: img.naturalHeight }
      : { width: img.width, height: img.height };

    const landmarks = detection.landmarks;
    const eyePoints = [...landmarks.getLeftEye(), ...landmarks.getRightEye()];
    const nosePoints = landmarks.getNose();
    const mouthPoints = landmarks.getMouth();

    if (!eyePoints.length || !nosePoints.length || !mouthPoints.length) {
      return null;
    }

    // The detected face box sets the scale for the feature crops below.
    const box = detection.detection.box;
    const face = clampRect({
      x: box.x / width,
      y: box.y / height,
      width: box.width / width,
      height: box.height / height,
    });

    // Landmarks hug the feature tightly. Pad them for context, then hold each
    // to a minimum share of the face so a small face in a large photo does not
    // produce a crop that is pure pixels when enlarged.
    const eyes = ensureMinSize(
      padRect(boundingBox(normalisePoints(eyePoints, width, height)), 0.12, 0.7),
      face.width * 0.85,
      face.height * 0.16
    );
    const nose = ensureMinSize(
      padRect(boundingBox(normalisePoints(nosePoints, width, height)), 0.3, 0.12),
      face.width * 0.34,
      face.height * 0.22
    );
    const mouth = ensureMinSize(
      padRect(boundingBox(normalisePoints(mouthPoints, width, height)), 0.22, 0.35),
      face.width * 0.48,
      face.height * 0.17
    );

    const regions: FaceRegions = {
      photoUrl,
      source: "detected",
      eyes,
      nose,
      mouth,
      full: clampRect({ x: 0, y: 0, width: 1, height: 1 }) as CropRect,
    };

    cacheRegions(regions);
    return regions;
  } catch (error) {
    console.warn(
      "🎮 faceDetection: falling back to heuristic crops for",
      photoUrl,
      error
    );
    return null;
  }
};

/**
 * Regions for a photo: detected when possible, heuristic otherwise.
 *
 * Never rejects — the game must stay playable whatever detection does.
 */
export const resolveFaceRegions = async (
  photoUrl: string
): Promise<FaceRegions> => {
  const detected = await detectFaceRegions(photoUrl).catch(() => null);
  return detected ?? heuristicRegions(photoUrl);
};

/**
 * Give up on detection for the rest of the session.
 *
 * Called when the first attempts fail outright (no models, or a photo host
 * without CORS), so later questions do not pay the cost again.
 */
export const disableDetection = (): void => {
  detectionDisabled = true;
};

/**
 * Detect regions for upcoming photos in the background.
 *
 * Results land in the cache, so by the time the player reaches the question its
 * crops are ready and nothing has to be shown twice. Never rejects.
 */
export const warmFaceRegions = (urls: (string | null | undefined)[]): void => {
  if (detectionDisabled) return;
  for (const url of urls) {
    if (!url) continue;
    detectFaceRegions(url).catch(() => {
      /* warming is best-effort */
    });
  }
};
