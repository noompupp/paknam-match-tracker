
interface MatchEventsSummarySectionProps {
  events: any[];
  formatTime: (seconds: number) => string;
}

const MatchEventsSummarySection = ({
  events,
  formatTime
}: MatchEventsSummarySectionProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Key Events ({events.length})</h4>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No events recorded</p>
      ) : (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {events.slice(-5).reverse().map((event) => (
            <div key={event.id} className="text-sm p-2 bg-muted/10 rounded">
              <div className="flex items-center justify-between">
                <span>{event.description}</span>
                <span className="text-xs text-muted-foreground">{formatTime(event.time)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchEventsSummarySection;
