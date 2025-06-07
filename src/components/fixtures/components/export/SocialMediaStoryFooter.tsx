
import { Users, Trophy } from "lucide-react";

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
    <div className="relative z-20 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-sm p-6 border-t border-white/10">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4 text-center mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div 
            className="text-3xl font-black mb-2 drop-shadow-lg"
            style={{ color: displayHomeColor }}
          >
            {homeGoals.length}
          </div>
          <div className="text-xs text-white/80 font-semibold uppercase tracking-wide">
            Home Goals
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="text-3xl font-black text-amber-400 mb-2 drop-shadow-lg">
            {cards.length}
          </div>
          <div className="text-xs text-white/80 font-semibold uppercase tracking-wide">
            Total Cards
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div 
            className="text-3xl font-black mb-2 drop-shadow-lg"
            style={{ color: displayAwayColor }}
          >
            {awayGoals.length}
          </div>
          <div className="text-xs text-white/80 font-semibold uppercase tracking-wide">
            Away Goals
          </div>
        </div>
      </div>
      
      {/* Professional Branding */}
      <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
        <div className="text-base font-bold text-white mb-2 flex items-center justify-center gap-3">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <span className="drop-shadow-sm">Match Report</span>
        </div>
        <div className="text-sm text-white/70 font-medium flex items-center justify-center gap-2">
          <Users className="h-4 w-4" />
          <span>Referee Tools • {new Date().toLocaleDateString()}</span>
        </div>
        
        {/* Subtle Decorative Elements */}
        <div className="flex justify-center gap-2 mt-3">
          <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-60" />
          <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full opacity-40" />
          <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryFooter;
