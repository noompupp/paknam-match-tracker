
import { Calendar, MapPin } from "lucide-react";

interface SocialMediaStoryMatchInfoProps {
  fixture: any;
}

const SocialMediaStoryMatchInfo = ({ fixture }: SocialMediaStoryMatchInfoProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
      <div className="flex items-center justify-center gap-6 text-sm text-white/80">
        {fixture.match_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatDate(fixture.match_date)}</span>
          </div>
        )}
        {fixture.venue && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium truncate max-w-[120px]">{fixture.venue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaStoryMatchInfo;
