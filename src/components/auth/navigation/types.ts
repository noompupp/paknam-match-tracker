
import { LucideIcon } from "lucide-react";

export interface BaseNavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ProtectedNavigationItem extends BaseNavigationItem {
  requiredRole: string;
  description: string;
}

export interface NavigationItemProps {
  item: BaseNavigationItem | ProtectedNavigationItem;
  isActive: boolean;
  isProtected?: boolean;
  isAccessible?: boolean;
  onClick: () => void;
  textRef: (el: HTMLSpanElement | null) => void;
}

export interface NavigationContainerProps {
  children: React.ReactNode;
}

export interface NavigationHandlers {
  handleSignOut: () => Promise<void>;
  handleSignIn: () => void;
  handleProtectedTabClick: (tabId: string) => void;
}
