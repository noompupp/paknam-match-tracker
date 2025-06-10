
import { MapPin } from "lucide-react";
import BaseInfoCard from "./BaseInfoCard";

interface VenueCardProps {
  venue: string;
}

const VenueCard = ({ venue }: VenueCardProps) => {
  if (!venue || venue === 'TBD') {
    return null;
  }

  return (
    <BaseInfoCard
      title="Venue"
      icon={<MapPin className="h-5 w-5" />}
      variant="primary"
    >
      <p className="font-semibold text-base leading-relaxed truncate">
        {venue}
      </p>
    </BaseInfoCard>
  );
};

export default VenueCard;
