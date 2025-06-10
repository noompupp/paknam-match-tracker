
import { MapPin } from "lucide-react";

interface VenueCardProps {
  venue: string;
}

const VenueCard = ({ venue }: VenueCardProps) => {
  if (!venue || venue === 'TBD') {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/50">
      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground mb-1">Venue</p>
        <p className="font-medium">{venue}</p>
      </div>
    </div>
  );
};

export default VenueCard;
