
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
    <div className="mt-auto bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-4 border-t-2 border-slate-200">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 text-center mb-3">
        <div>
          <div className="text-xl font-bold" style={{ color: displayHomeColor }}>
            {homeGoals.length}
          </div>
          <div className="text-xs text-slate-600 font-semibold">Goals</div>
        </div>
        <div>
          <div className="text-xl font-bold text-amber-600">{cards.length}</div>
          <div className="text-xs text-slate-600 font-semibold">Cards</div>
        </div>
        <div>
          <div className="text-xl font-bold" style={{ color: displayAwayColor }}>
            {awayGoals.length}
          </div>
          <div className="text-xs text-slate-600 font-semibold">Goals</div>
        </div>
      </div>
      
      {/* Branding */}
      <div className="text-center border-t border-slate-200 pt-3">
        <div className="text-sm font-bold text-slate-700 mb-1">
          📊 Match Report
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Referee Tools • {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryFooter;
