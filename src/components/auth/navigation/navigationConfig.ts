
import { Home, Calendar, Trophy, Flag, Users } from "lucide-react";
import { BaseNavigationItem, ProtectedNavigationItem } from './types';

export const baseNavItems: BaseNavigationItem[] = [
  { id: "dashboard", label: "Latest", icon: Home },
  { id: "teams", label: "Teams", icon: Users },
  { id: "results", label: "Results", icon: Trophy },
  { id: "fixtures", label: "Fixtures", icon: Calendar },
];

export const protectedNavItems: ProtectedNavigationItem[] = [
  { 
    id: "referee", 
    label: "Referee", 
    icon: Flag, 
    requiredRole: "referee",
    description: "Access referee tools and match management"
  },
];
