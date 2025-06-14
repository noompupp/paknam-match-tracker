
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

interface MiniPlayerAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: number;
}

const MiniPlayerAvatar = ({
  name,
  imageUrl,
  className = "",
  size = 32,
}: MiniPlayerAvatarProps) => {
  // Always log exactly what is received
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[MiniPlayerAvatar][PROPS RECEIVED]", { name, imageUrl, size });
  }, [name, imageUrl, size]);

  const getInitials = (n: string) =>
    n
      ? n
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?";

  // Strict check: do not override imageUrl, do not sanitize/trim. Direct pass-through.
  return (
    <Avatar
      className={cn(
        "rounded-full ring-1 ring-border bg-muted flex items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-label={`${name || "Player"} avatar`}
    >
      {imageUrl ? (
        <>
          {/* Deep log rendering decision */}
          {/* eslint-disable-next-line no-console */}
          {console.log("[MiniPlayerAvatar][RENDERING IMAGE]", imageUrl)}
          <AvatarImage
            src={imageUrl}
            alt={name}
            className="object-cover rounded-full"
            style={{ width: size, height: size }}
          />
        </>
      ) : (
        <>
          {/* eslint-disable-next-line no-console */}
          {console.log("[MiniPlayerAvatar][RENDERING FALLBACK INITIALS]", name)}
          <AvatarFallback
            className="bg-muted text-xs text-foreground font-semibold flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            {getInitials(name)}
          </AvatarFallback>
        </>
      )}
    </Avatar>
  );
};

export default MiniPlayerAvatar;
