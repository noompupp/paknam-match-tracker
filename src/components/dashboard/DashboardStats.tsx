
import TopScorersCard from "./TopScorersCard";
import TopAssistsCard from "./TopAssistsCard";
import { useEnhancedTopScorers, useEnhancedTopAssists } from "@/hooks/useEnhancedPlayerStats";

const DashboardStats = () => {
  const { data: topScorers, isLoading: scorersLoading } = useEnhancedTopScorers(5);
  const { data: topAssists, isLoading: assistsLoading } = useEnhancedTopAssists(5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TopScorersCard 
        topScorers={topScorers} 
        isLoading={scorersLoading}
      />
      <TopAssistsCard 
        topAssists={topAssists} 
        isLoading={assistsLoading}
      />
    </div>
  );
};

export default DashboardStats;
