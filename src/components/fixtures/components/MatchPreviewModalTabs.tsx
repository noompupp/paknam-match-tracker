
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMatchData } from "@/services/fixtures/enhancedMatchDataService";
import MatchPreviewOverview from "./MatchPreviewOverview";
import MatchPreviewSquads from "./MatchPreviewSquads";
import MatchPreviewForm from "./MatchPreviewForm";
import MatchPreviewInsights from "./MatchPreviewInsights";
import PredictedStarting7 from "./PredictedStarting7";
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
        "grid w-full grid-cols-5 mb-4 bg-muted/50 backdrop-blur-sm border border-border/30 rounded-lg",
        isMobilePortrait ? "h-10 p-1" : "h-11 p-1"
      )}>
        <TabsTrigger 
          value="overview" 
          className={cn(
            "font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all duration-200 flex items-center justify-center",
            isMobilePortrait ? "text-xs h-8 px-1" : "text-sm h-9 px-2"
          )}
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="squads" 
          className={cn(
            "font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all duration-200 flex items-center justify-center",
            isMobilePortrait ? "text-xs h-8 px-1" : "text-sm h-9 px-2"
          )}
        >
          Squads
        </TabsTrigger>
        <TabsTrigger 
          value="form" 
          className={cn(
            "font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all duration-200 flex items-center justify-center",
            isMobilePortrait ? "text-xs h-8 px-1" : "text-sm h-9 px-2"
          )}
        >
          Form
        </TabsTrigger>
        <TabsTrigger 
          value="insights" 
          className={cn(
            "font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all duration-200 flex items-center justify-center",
            isMobilePortrait ? "text-xs h-8 px-1" : "text-sm h-9 px-2"
          )}
        >
          Insights
        </TabsTrigger>
        <TabsTrigger 
          value="predicted" 
          className={cn(
            "font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all duration-200 flex items-center justify-center",
            isMobilePortrait ? "text-xs h-8 px-1" : "text-sm h-9 px-2"
          )}
        >
          Starting 7
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4 mt-0">
        <MatchPreviewOverview 
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
          headToHead={matchData.headToHead}
        />
      </TabsContent>
      
      <TabsContent value="squads" className="space-y-4 mt-0">
        <MatchPreviewSquads 
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
          homeSquad={matchData.homeSquad}
          awaySquad={matchData.awaySquad}
        />
      </TabsContent>
      
      <TabsContent value="form" className="space-y-4 mt-0">
        <MatchPreviewForm 
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
          recentForm={matchData.recentForm}
        />
      </TabsContent>

      <TabsContent value="insights" className="space-y-4 mt-0">
        <MatchPreviewInsights 
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
        />
      </TabsContent>

      <TabsContent value="predicted" className="space-y-4 mt-0">
        <PredictedStarting7 
          homeTeam={matchData.homeTeam}
          awayTeam={matchData.awayTeam}
          homeSquad={matchData.homeSquad}
          awaySquad={matchData.awaySquad}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MatchPreviewModalTabs;
