import { useEffect, useState } from "react";
import {
  detectFaceRegions,
  disableDetection,
  isDetectionAvailable,
} from "@/services/game/faceDetection";
import { heuristicRegions } from "@/services/game/faceRegions";
import type { FaceRegions } from "@/services/game/guessGameTypes";

/**
 * Crop rectangles for a photo.
 *
 * The heuristic crops and the detected ones can frame quite different parts of
 * a face, so showing the heuristic first and swapping it out would flash the
 * wrong region at the player. Instead the caller is told the regions are still
 * resolving and can show a placeholder until detection settles — or until the
 * timeout below, after which the heuristic is used.
 */

/** Detection is switched off after this many photos in a row come back empty. */
const FAILURE_LIMIT = 3;
/** Longest we make a player wait for detection before falling back. */
const RESOLVE_TIMEOUT_MS = 3500;

let consecutiveFailures = 0;

const noteFailure = () => {
  consecutiveFailures += 1;
  if (consecutiveFailures >= FAILURE_LIMIT) disableDetection();
};

export const useFaceRegions = (photoUrl: string | null | undefined) => {
  const [regions, setRegions] = useState<FaceRegions | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!photoUrl) {
      setRegions(null);
      setIsResolving(false);
      return;
    }

    // Nothing to wait for once detection is known to be unusable.
    if (!isDetectionAvailable()) {
      setRegions(heuristicRegions(photoUrl));
      setIsResolving(false);
      return;
    }

    let active = true;
    setRegions(null);
    setIsResolving(true);

    const settle = (resolved: FaceRegions) => {
      if (!active) return;
      active = false;
      setRegions(resolved);
      setIsResolving(false);
    };

    const timer = window.setTimeout(
      () => settle(heuristicRegions(photoUrl)),
      RESOLVE_TIMEOUT_MS
    );

    detectFaceRegions(photoUrl)
      .then((detected) => {
        if (detected) {
          consecutiveFailures = 0;
          settle(detected);
          return;
        }
        noteFailure();
        settle(heuristicRegions(photoUrl));
      })
      .catch(() => {
        noteFailure();
        settle(heuristicRegions(photoUrl));
      });

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [photoUrl]);

  return { regions, isResolving };
};
