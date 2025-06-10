
import { MapPin } from "lucide-react";

interface VenueCardProps {
  venue: string;
}

const VenueCard = ({ venue }: VenueCardProps) => {
  if (!venue || venue === 'TBD') {
    return null;
  }

  return (
    <div className="flex items-start gap-4 text-sm p-4 rounded-xl bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border border-primary/20 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
      <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 border border-primary/20">
        <MapPin className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          Venue
        </p>
        <p className="font-semibold text-foreground text-base leading-relaxed">
          {venue}
        </p>
      </div>
    </div>
  );
};

export default VenueCard;
