
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  const handlePreviousMonth = () => {
    const newMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    onMonthChange(newMonth);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onMonthChange(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        className="h-9 w-9 sm:h-10 sm:w-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        onClick={handleCurrentMonth}
        className="min-w-[160px] sm:min-w-[200px] font-semibold text-sm sm:text-base px-3 sm:px-4"
      >
        {format(selectedMonth, 'MMMM yyyy')}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        className="h-9 w-9 sm:h-10 sm:w-10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthSelector;
