
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMatchData } from "@/services/fixtures/enhancedMatchDataService";
import MatchPreviewOverview from "./MatchPreviewOverview";
import MatchPreviewSquads from "./MatchPreviewSquads";
import MatchPreviewForm from "./MatchPreviewForm";

interface MatchPreviewModalTabsProps {
  matchData: EnhancedMatchData;
}

const MatchPreviewModalTabs = ({ matchData }: MatchPreviewModalTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-muted/50 backdrop-blur-sm">
        <TabsTrigger 
          value="overview" 
          className="text-sm font-medium py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="squads" 
          className="text-sm font-medium py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
        >
          Squads
        </TabsTrigger>
        <TabsTrigger 
          value="form" 
          className="text-sm font-medium py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
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
