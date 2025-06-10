
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMatchData } from "@/services/fixtures/enhancedMatchDataService";
import MatchPreviewOverview from "./MatchPreviewOverview";
import MatchPreviewSquads from "./MatchPreviewSquads";
import MatchPreviewForm from "./MatchPreviewForm";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { cn } from "@/lib/utils";

interface MatchPreviewModalTabsProps {
  matchData: EnhancedMatchData;
}

const MatchPreviewModalTabs = ({ matchData }: MatchPreviewModalTabsProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className={cn(
        "grid w-full grid-cols-3 mb-6 bg-muted/50 backdrop-blur-sm border border-border/30 rounded-lg p-1",
        isMobilePortrait ? "h-10" : "h-11"
      )}>
        <TabsTrigger 
          value="overview" 
          className={cn(
            "font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all duration-200",
            isMobilePortrait ? "text-xs py-2 px-2" : "text-sm py-2.5 px-3"
          )}
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="squads" 
          className={cn(
            "font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all duration-200",
            isMobilePortrait ? "text-xs py-2 px-2" : "text-sm py-2.5 px-3"
          )}
        >
          Squads
        </TabsTrigger>
        <TabsTrigger 
          value="form" 
          className={cn(
            "font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all duration-200",
            isMobilePortrait ? "text-xs py-2 px-2" : "text-sm py-2.5 px-3"
          )}
        >
          Form
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6 mt-0">
        <MatchPreviewOverview 
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
          headToHead={matchData.headToHead}
        />
      </TabsContent>
      
      <TabsContent value="squads" className="space-y-6 mt-0">
        <MatchPreviewSquads 
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
          homeSquad={matchData.homeSquad}
          awaySquad={matchData.awaySquad}
        />
      </TabsContent>
      
      <TabsContent value="form" className="space-y-6 mt-0">
        <MatchPreviewForm 
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
          recentForm={matchData.recentForm}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MatchPreviewModalTabs;
