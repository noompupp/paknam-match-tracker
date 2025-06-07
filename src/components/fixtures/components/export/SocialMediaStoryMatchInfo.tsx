
import { Calendar, MapPin } from "lucide-react";

interface SocialMediaStoryMatchInfoProps {
  fixture: any;
}

const SocialMediaStoryMatchInfo = ({ fixture }: SocialMediaStoryMatchInfoProps) => {
  return (
    <div className="flex items-center justify-center gap-4 text-sm text-white/80 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm border border-white/20">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span className="font-semibold">{fixture.match_date}</span>
      </div>
      {fixture.kick_off_time && (
        <>
          <span className="text-white/50">•</span>
          <span className="font-semibold">KO: {fixture.kick_off_time}</span>
        </>
      )}
      {fixture.venue && (
        <>
          <span className="text-white/50">•</span>
          <div className="flex items-center gap-1 max-w-[100px]">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-semibold">{fixture.venue}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default SocialMediaStoryMatchInfo;
