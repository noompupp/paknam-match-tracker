
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Displays a small, circular player avatar with fallback to initials.
 */
interface MiniPlayerAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: number; // px, for flexibility
}

const MiniPlayerAvatar = ({
  name,
  imageUrl,
  className = "",
  size = 32,
}: MiniPlayerAvatarProps) => {
  // Extract initials (up to 2 letters)
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
        "rounded-full ring-1 ring-border bg-muted flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <AvatarImage
        src={imageUrl || undefined}
        alt={name}
        className="object-cover rounded-full"
        style={{ width: size, height: size }}
      />
      <AvatarFallback
        className="bg-muted text-xs text-foreground font-semibold flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default MiniPlayerAvatar;

