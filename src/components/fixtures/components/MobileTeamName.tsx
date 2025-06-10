
import { cn } from "@/lib/utils";
import { getResponsiveTeamName } from "@/utils/teamNameUtils";

interface MobileTeamNameProps {
  teamName: string;
  className?: string;
}

const MobileTeamName = ({ teamName, className }: MobileTeamNameProps) => {
  const responsiveNames = getResponsiveTeamName(teamName);

  return (
    <div className={cn("text-center", className)}>
      {/* Full name on larger screens */}
      <span className="hidden sm:inline font-semibold text-foreground">
        {responsiveNames.full}
      </span>
      
      {/* Mobile name on small screens */}
      <span className="sm:hidden font-semibold text-foreground text-sm leading-tight">
        {responsiveNames.mobile}
      </span>
    </div>
  );
};

export default MobileTeamName;
