
import { Member, Team } from "@/types/database";

export interface PlayerAvatarProps {
  player: Member;
  team?: Team;
  size?: "small" | "medium" | "large";
  showStats?: boolean;
  className?: string;
  autoFlip?: boolean;
  disabled?: boolean;
}

export interface TeamColors {
  primary: string;
  secondary: string;
  accent: string;
  contrast: string;
  shadow: string;
}

export interface SizeClasses {
  small: string;
  medium: string;
  large: string;
}
