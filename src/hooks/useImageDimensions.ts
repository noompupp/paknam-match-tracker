import { useEffect, useState } from "react";
import { loadImage } from "@/services/game/playerPhoto";

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Natural pixel size of a photo, needed to give a normalised crop the right
 * aspect ratio on screen. Returns null until the image has loaded.
 */
export const useImageDimensions = (url: string | null | undefined) => {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) {
      setDimensions(null);
      setFailed(false);
      return;
    }

    let active = true;
    setDimensions(null);
    setFailed(false);

    loadImage(url)
      .then((img) => {
        if (!active) return;
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [url]);

  return { dimensions, failed };
};
