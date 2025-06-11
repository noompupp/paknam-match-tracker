
import { LucideIcon } from "lucide-react";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface ResponsiveTabsListProps {
  tabs: TabItem[];
  className?: string;
}

export interface TabTriggerProps {
  tab: TabItem;
  isMobile: boolean;
  className?: string;
}
