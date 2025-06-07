
interface CompactScoreDisplayProps {
  homeScore: number;
  awayScore: number;
  homeTeamColor: string;
  awayTeamColor: string;
  status?: string;
}

const CompactScoreDisplay = ({
  homeScore,
  awayScore,
  homeTeamColor,
  awayTeamColor,
  status = 'completed'
}: CompactScoreDisplayProps) => {
  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-lg border">
      <span 
        className="text-2xl font-bold min-w-[24px] text-center"
        style={{ color: homeTeamColor }}
      >
        {homeScore}
      </span>
      <span className="text-gray-400 font-medium">-</span>
      <span 
        className="text-2xl font-bold min-w-[24px] text-center"
        style={{ color: awayTeamColor }}
      >
        {awayScore}
      </span>
      {status && status !== 'completed' && (
        <span className="ml-2 text-xs text-gray-500 uppercase font-medium">
          {status}
        </span>
      )}
    </div>
  );
};

export default CompactScoreDisplay;
