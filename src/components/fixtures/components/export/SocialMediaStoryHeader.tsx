
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface SocialMediaStoryHeaderProps {
  fixture: any;
}

const SocialMediaStoryHeader = ({ fixture }: SocialMediaStoryHeaderProps) => {
  return (
    <div className="relative z-20 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 backdrop-blur-sm text-white p-6 text-center border-b border-white/10">
      {/* Tournament Header */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-wider text-white drop-shadow-lg">
          PREMIER LEAGUE
        </h1>
      </div>
      
      {/* Match Status Badge */}
      <Badge 
        variant="outline" 
        className="bg-white/20 border-white/30 text-white text-lg font-bold px-6 py-3 backdrop-blur-sm shadow-lg hover:bg-white/25 transition-all"
      >
        {fixture.status === 'completed' ? 'FULL TIME' : 'LIVE'}
      </Badge>
      
      {/* Decorative Elements */}
      <div className="absolute top-2 left-2 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full opacity-60" />
      <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-br from-white to-gray-200 rounded-full opacity-40" />
      <div className="absolute bottom-3 left-6 w-1.5 h-1.5 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full opacity-50" />
    </div>
  );
};

export default SocialMediaStoryHeader;
