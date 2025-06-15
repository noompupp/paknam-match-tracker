
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, FileText, AlertTriangle } from "lucide-react";

const RefereeTabsNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="score" className="flex items-center gap-2">
        <Trophy className="h-4 w-4" />
        <span className="hidden sm:inline">Score</span>
      </TabsTrigger>
      <TabsTrigger value="timer-tracking" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="hidden sm:inline">Timer</span>
      </TabsTrigger>
      {/* Removed Goals Tab */}
      <TabsTrigger value="cards" className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="hidden sm:inline">Cards</span>
      </TabsTrigger>
      <TabsTrigger value="summary" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Summary</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default RefereeTabsNavigation;
