
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

  // Strict fallback: Only fallback if imageUrl is null, undefined, or only whitespace
  const shouldFallbackToInitials =
    !imageUrl || (typeof imageUrl === "string" && imageUrl.trim() === "");

  useEffect(() => {
    // eslint-disable-next-line no-console
    if (shouldFallbackToInitials) {
      console.log("[MiniPlayerAvatar][FALLBACK] Using initials for:", name, imageUrl);
    } else {
      console.log("[MiniPlayerAvatar][IMAGE] Using avatar image for:", name, imageUrl);
    }
  }, [name, imageUrl, shouldFallbackToInitials]);

  return (
    <Avatar
      className={cn(
        "rounded-full ring-1 ring-border bg-muted flex items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-label={`${name || "Player"} avatar`}
    >
      {!shouldFallbackToInitials ? (
        <AvatarImage
          src={imageUrl as string}
          alt={name}
          className="object-cover rounded-full"
          style={{ width: size, height: size }}
        />
      ) : (
        <AvatarFallback
          className="bg-muted text-xs text-foreground font-semibold flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          {getInitials(name)}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default MiniPlayerAvatar;
