import { cn } from "@/lib/utils";
import { useImageDimensions } from "@/hooks/useImageDimensions";
import { normalizePhotoUrl } from "@/services/game/playerPhoto";
import type {
  CropRect,
  FacePart,
  FaceRegions,
} from "@/services/game/guessGameTypes";
import { ImageOff, Loader2 } from "lucide-react";

interface FaceCropViewProps {
  photoUrl: string;
  regions: FaceRegions;
  /** Parts of the face currently revealed, in the order they should stack. */
  visibleParts: FacePart[];
  /** 0 = fully sharp. Higher values blur the crop to make the question harder. */
  blurPx?: number;
  className?: string;
}

/** Facial order, so revealed parts always stack the way a face reads. */
const PART_ORDER: FacePart[] = ["eyes", "nose", "mouth"];

const PART_LABELS: Record<FacePart, string> = {
  eyes: "ตา",
  nose: "จมูก",
  mouth: "ปาก",
  full: "รูปเต็ม",
};

/**
 * CSS values that show only `rect` of the source image.
 *
 * The crop is done with background positioning rather than a canvas, because
 * the photos come from an external host that may not send CORS headers — a
 * canvas crop would be blocked, but background rendering always works.
 */
const cropStyle = (src: string, rect: CropRect): React.CSSProperties => {
  const positionX = rect.width >= 1 ? 0 : (rect.x / (1 - rect.width)) * 100;
  const positionY = rect.height >= 1 ? 0 : (rect.y / (1 - rect.height)) * 100;

  return {
    backgroundImage: `url("${src}")`,
    backgroundSize: `${100 / rect.width}% ${100 / rect.height}%`,
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundRepeat: "no-repeat",
  };
};

/** Widest a crop tile is drawn, and how far its source may be enlarged. */
const MAX_TILE_WIDTH = 240;
const MIN_TILE_WIDTH = 130;
const MAX_UPSCALE = 2.5;

/**
 * On-screen width for a crop.
 *
 * Enlarging a small crop to fill the card turns it into a blur of pixels, so a
 * tile never grows more than `MAX_UPSCALE` beyond the crop's real size.
 */
const displayWidth = (cropPixelWidth: number): number =>
  Math.round(
    Math.min(MAX_TILE_WIDTH, Math.max(MIN_TILE_WIDTH, cropPixelWidth * MAX_UPSCALE))
  );

const FaceCropView = ({
  photoUrl,
  regions,
  visibleParts,
  blurPx = 0,
  className,
}: FaceCropViewProps) => {
  const src = normalizePhotoUrl(photoUrl);
  const { dimensions, failed } = useImageDimensions(photoUrl);

  if (failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-muted-foreground",
          className
        )}
      >
        <ImageOff className="h-8 w-8" />
        <p className="text-sm">โหลดรูปไม่สำเร็จ</p>
      </div>
    );
  }

  if (!dimensions) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-border bg-muted/40 p-12",
          className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const showFullPhoto = visibleParts.includes("full");
  const imageAspect = dimensions.width / dimensions.height;

  if (showFullPhoto) {
    return (
      <div className={cn("flex justify-center", className)}>
        <div
          className="w-full max-w-[260px] overflow-hidden rounded-2xl border-2 border-primary/30 bg-muted shadow-lg animate-scale-in"
          style={{ aspectRatio: `${imageAspect}` }}
        >
          <img
            src={src}
            alt="รูปโปรไฟล์สมาชิก"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    );
  }

  const parts = PART_ORDER.filter((part) => visibleParts.includes(part));

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {parts.map((part) => {
        const rect = regions[part];
        const cropPixelWidth = rect.width * dimensions.width;
        // Aspect ratio of the crop as it appears in the original photo.
        const cropAspect =
          (rect.width * dimensions.width) / (rect.height * dimensions.height);

        return (
          <div
            key={part}
            className="animate-fade-in"
            style={{ width: displayWidth(cropPixelWidth) }}
          >
            <div
              className="w-full overflow-hidden rounded-xl border-2 border-primary/30 bg-muted shadow-md transition-[filter] duration-500"
              style={{
                ...cropStyle(src, rect),
                aspectRatio: `${cropAspect}`,
                filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
              }}
              role="img"
              aria-label={`ส่วน${PART_LABELS[part]}ของสมาชิก`}
            />
            <p className="mt-1 text-center text-xs font-medium text-muted-foreground">
              {PART_LABELS[part]}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default FaceCropView;
