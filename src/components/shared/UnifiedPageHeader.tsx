
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import TeamLogo from "../teams/TeamLogo";
import LanguageToggle from "./LanguageToggle";

interface UnifiedPageHeaderProps {
  title: string;
  subtitle?: string;
  logoSize?: 'small' | 'medium' | 'large';
  showLanguageToggle?: boolean;
  className?: string;
  badge?: string;
}

const UnifiedPageHeader = ({ 
  title, 
  subtitle, 
  logoSize = 'medium',
  showLanguageToggle = false,
  className,
  badge
}: UnifiedPageHeaderProps) => {
  // Mock team object for logo - you might want to make this configurable
  const defaultTeam = { id: 1, name: "League", logo_url: null };

  return (
    <div className={cn(
      "bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b border-border/20",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TeamLogo team={defaultTeam} size={logoSize} />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  {title}
                </h1>
                {badge && (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {badge}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-muted-foreground text-sm md:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {showLanguageToggle && (
            <div className="flex items-center">
              <LanguageToggle />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedPageHeader;
