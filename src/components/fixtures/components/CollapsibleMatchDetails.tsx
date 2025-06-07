
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import EnhancedMatchDetails from "../EnhancedMatchDetails";

interface CollapsibleMatchDetailsProps {
  fixture: any;
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
}

const CollapsibleMatchDetails = ({
  fixture,
  timelineEvents,
  formatTime
}: CollapsibleMatchDetailsProps) => {
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  return (
    <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between hover:bg-muted/50">
          <span>Match Details</span>
          {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2">
          <EnhancedMatchDetails 
            fixture={fixture}
            timelineEvents={timelineEvents}
            formatTime={formatTime}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleMatchDetails;
