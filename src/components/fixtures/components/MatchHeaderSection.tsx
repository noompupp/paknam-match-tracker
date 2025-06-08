
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileMatchHeader from "./MobileMatchHeader";
import DesktopMatchHeader from "./DesktopMatchHeader";

interface MatchHeaderSectionProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const MatchHeaderSection = ({
  fixture,
  homeTeamColor,
  awayTeamColor
}: MatchHeaderSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="overflow-hidden premier-card-shadow-lg match-border-gradient w-full">
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'} match-gradient-header w-full`}>
        {isMobile ? (
          <MobileMatchHeader 
            fixture={fixture}
            homeTeamColor={homeTeamColor}
            awayTeamColor={awayTeamColor}
          />
        ) : (
          <DesktopMatchHeader 
            fixture={fixture}
            homeTeamColor={homeTeamColor}
            awayTeamColor={awayTeamColor}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MatchHeaderSection;
