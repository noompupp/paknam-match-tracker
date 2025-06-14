
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
  // Log every time component renders
  useEffect(() => {
    console.log(
      "[MiniPlayerAvatar] PROPS RECEIVED →",
      { name, imageUrl, size }
    );
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
        <AvatarImage
          src={imageUrl}
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

