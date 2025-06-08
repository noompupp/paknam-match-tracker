
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, CreditCard, Timer, FileText } from "lucide-react";

const ResponsiveRefereeTabsNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="score" className="flex items-center gap-2">
        <Trophy className="h-4 w-4" />
        <span className="hidden sm:inline">Score & Goals</span>
        <span className="sm:hidden">Score</span>
      </TabsTrigger>
      <TabsTrigger value="timer" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="hidden sm:inline">Timer</span>
        <span className="sm:hidden">Time</span>
      </TabsTrigger>
      <TabsTrigger value="cards" className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        <span className="hidden sm:inline">Cards</span>
        <span className="sm:hidden">Cards</span>
      </TabsTrigger>
      <TabsTrigger value="time" className="flex items-center gap-2">
        <Timer className="h-4 w-4" />
        <span className="hidden sm:inline">Player Time</span>
        <span className="sm:hidden">Players</span>
      </TabsTrigger>
      <TabsTrigger value="summary" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Summary</span>
        <span className="sm:hidden">Summary</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default ResponsiveRefereeTabsNavigation;
