
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const RefereeTabsNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-6">
      <TabsTrigger value="score">Score</TabsTrigger>
      <TabsTrigger value="timer">Timer</TabsTrigger>
      <TabsTrigger value="goals">Goals</TabsTrigger>
      <TabsTrigger value="cards">Cards</TabsTrigger>
      <TabsTrigger value="time">Time</TabsTrigger>
      <TabsTrigger value="summary">Summary</TabsTrigger>
    </TabsList>
  );
};

export default RefereeTabsNavigation;
