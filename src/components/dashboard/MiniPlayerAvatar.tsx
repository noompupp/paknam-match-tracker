
// Stripped-down MiniPlayerAvatar relying purely on provided profileImageUrl
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
  const profileImageSrc = typeof imageUrl === "string" && imageUrl.trim() !== "" ? imageUrl : undefined;

  return (
    <Avatar
      className={cn(
        "rounded-full ring-1 ring-border bg-muted flex items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-label={`${name || "Player"} avatar`}
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
