
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnhancedMatchEventsTimeline from "@/components/referee/components/EnhancedMatchEventsTimeline";

interface CollapsibleMatchTimelineProps {
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
  defaultOpen?: boolean;
}

const CollapsibleMatchTimeline = ({
  timelineEvents,
  formatTime,
  defaultOpen = false
}: CollapsibleMatchTimelineProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Enhanced Match Timeline</span>
                <span className="text-sm text-muted-foreground">
                  ({timelineEvents.length} events)
                </span>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <CardContent className="pt-0">
            {timelineEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No timeline events recorded for this match
              </p>
            ) : (
              <div className="space-y-3">
                {timelineEvents.map((event, index) => (
                  <div 
                    key={`${event.id}-${index}`}
                    className="relative flex items-start gap-3 p-3 bg-muted/10 rounded-lg border-l-4 border-l-blue-200 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {event.description || `${event.playerName} - ${event.type}`}
                        </p>
                        
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatTime(event.time)}'
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {timelineEvents.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Showing all {timelineEvents.length} timeline events
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default CollapsibleMatchTimeline;
