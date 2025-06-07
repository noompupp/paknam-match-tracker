
import { Trophy } from "lucide-react";

interface SocialMediaStoryFooterProps {
  homeGoals: any[];
  awayGoals: any[];
  cards: any[];
  displayHomeColor: string;
  displayAwayColor: string;
}

const SocialMediaStoryFooter = ({
  homeGoals,
  awayGoals,
  cards,
  displayHomeColor,
  displayAwayColor
}: SocialMediaStoryFooterProps) => {
  return (
    <div className="relative z-20 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-sm p-4 border-t border-white/10">
      {/* Clean Professional Branding */}
      <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
        <div className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <span className="drop-shadow-sm">Match Report</span>
        </div>
        <div className="text-sm text-white/80 font-medium">
          Referee Tools • {new Date().toLocaleDateString()}
        </div>
        
        {/* Elegant Decorative Elements */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-70" />
          <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full opacity-50" />
          <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-70" />
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryFooter;
