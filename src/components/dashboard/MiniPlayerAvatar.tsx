
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";

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
  size = 28, // Smarter default for compact lists
}: MiniPlayerAvatarProps) => {
  React.useEffect(() => {
    // Small console log, can disable in prod
    // console.log("[Avatar Debug] Rendering", { name, imageUrl });
  }, [name, imageUrl]);

  const profileImageSrc =
    typeof imageUrl === "string" && imageUrl.trim() !== "" ? imageUrl : undefined;

  // Warn if we are falling back to blank avatar
  if (!profileImageSrc) {
    // console.warn("[Avatar Fallback]", { name, attemptedImage: imageUrl });
  }

  return (
    <Avatar
      className={cn(
        "rounded-full ring-1 ring-border bg-muted flex items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-label={`${name || "Player"} avatar`}
      data-avatar={name}
    >
      {profileImageSrc ? (
        <AvatarImage
          src={profileImageSrc}
          alt={name}
          className="object-cover rounded-full"
          style={{ width: size, height: size }}
        />
      ) : null}
    </Avatar>
  );
};

export default MiniPlayerAvatar;
