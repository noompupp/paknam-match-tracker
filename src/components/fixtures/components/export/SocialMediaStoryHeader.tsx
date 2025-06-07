
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface SocialMediaStoryHeaderProps {
  fixture: any;
}

const SocialMediaStoryHeader = ({ fixture }: SocialMediaStoryHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h1 className="text-lg font-bold tracking-wide">PREMIER LEAGUE</h1>
      </div>
      <Badge 
        variant="outline" 
        className="bg-white/10 border-white/20 text-white text-sm font-semibold px-3 py-1"
      >
        {fixture.status === 'completed' ? 'FULL TIME' : 'LIVE'}
      </Badge>
    </div>
  );
};

export default SocialMediaStoryHeader;
