
import { Badge } from "@/components/ui/badge";

interface MatchResultBadgeProps {
  fixture: any;
  className?: string;
}

const MatchResultBadge = ({ fixture, className = "" }: MatchResultBadgeProps) => {
  const getResult = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'Home Win';
    if (awayScore > homeScore) return 'Away Win';
    return 'Draw';
  };

  const getResultColor = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'text-green-600';
    if (awayScore > homeScore) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <Badge variant="outline" className={`text-xs ${getResultColor()} ${className}`}>
      {getResult()}
    </Badge>
  );
};

export default MatchResultBadge;
