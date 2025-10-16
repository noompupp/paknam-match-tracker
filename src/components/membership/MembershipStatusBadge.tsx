import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface MembershipStatusBadgeProps {
  status: 'active' | 'inactive';
  size?: 'sm' | 'md' | 'lg';
}

const MembershipStatusBadge: React.FC<MembershipStatusBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const { t } = useTranslation();
  const isActive = status === 'active';

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
      variant={isActive ? 'default' : 'destructive'}
      className={`${sizeClasses[size]} flex items-center gap-1 ${
        isActive 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-red-600 hover:bg-red-700'
      }`}
    >
      {isActive ? (
        <CheckCircle2 className={iconSize[size]} />
      ) : (
        <AlertCircle className={iconSize[size]} />
      )}
      {t(isActive ? 'membership.statusActive' : 'membership.statusInactive')}
    </Badge>
  );
};

export default MembershipStatusBadge;
