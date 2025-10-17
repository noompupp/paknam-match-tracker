import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface FeeExemptBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

const FeeExemptBadge: React.FC<FeeExemptBadgeProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Badge
      className={`${sizeClasses[size]} flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white`}
    >
      <Star className={iconSize[size]} fill="currentColor" />
      Fee Exempt
    </Badge>
  );
};

export default FeeExemptBadge;
