
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerStatusBadgeProps {
  role: string;
  totalTime: number;
  currentHalfTime: number;
  isPlaying: boolean;
  matchTime: number;
  className?: string;
}

const PlayerStatusBadge = ({
  role,
  totalTime,
  currentHalfTime,
  isPlaying,
  matchTime,
  className
}: PlayerStatusBadgeProps) => {
  const getStatusInfo = () => {
    const roleNormalized = role.toLowerCase();
    
    // S-class players: 20 minutes per half limit
    if (roleNormalized === 's-class') {
      const limitSeconds = 20 * 60; // 20 minutes
      const warningThreshold = 18 * 60; // 18 minutes
      
      if (currentHalfTime >= limitSeconds) {
        return {
          label: "LIMIT REACHED",
          variant: "destructive" as const,
          icon: AlertTriangle,
          description: "20min limit reached"
        };
      }
      
      if (currentHalfTime >= warningThreshold) {
        return {
          label: "APPROACHING LIMIT",
          variant: "secondary" as const,
          icon: Timer,
          description: `${Math.floor((limitSeconds - currentHalfTime) / 60)}min left`
        };
      }
      
      return {
        label: "WITHIN LIMIT",
        variant: "default" as const,
        icon: CheckCircle,
        description: `${Math.floor(currentHalfTime / 60)}/20min`
      };
    }
    
    // Starter players: 10 minutes minimum total
    if (roleNormalized === 'starter') {
      const minTotal = 10 * 60; // 10 minutes
      const remainingMatchTime = (50 * 60) - matchTime; // 50 min total match
      
      if (totalTime >= minTotal) {
        return {
          label: "MIN MET",
          variant: "default" as const,
          icon: CheckCircle,
          description: `${Math.floor(totalTime / 60)}min played`
        };
      }
      
      if (remainingMatchTime < 300 && totalTime < minTotal) { // 5 minutes remaining
        return {
          label: "NEEDS TIME",
          variant: "secondary" as const,
          icon: AlertTriangle,
          description: `Need ${Math.floor((minTotal - totalTime) / 60)}min more`
        };
      }
      
      return {
        label: "IN PROGRESS",
        variant: "outline" as const,
        icon: Clock,
        description: `${Math.floor(totalTime / 60)}/10min min`
      };
    }
    
    // Captain players: no limits
    return {
      label: "NO LIMITS",
      variant: "outline" as const,
      icon: CheckCircle,
      description: "Unlimited playtime"
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Badge variant={status.variant} className="text-xs px-2 py-0.5 h-5">
        <Icon className="h-3 w-3 mr-1" />
        {status.label}
      </Badge>
      <span className="text-xs text-muted-foreground text-center leading-none">
        {status.description}
      </span>
    </div>
  );
};

export default PlayerStatusBadge;
