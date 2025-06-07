
import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";

interface MatchSummaryViewToggleProps {
  viewStyle: 'compact' | 'full';
  onToggle: (style: 'compact' | 'full') => void;
}

const MatchSummaryViewToggle = ({ viewStyle, onToggle }: MatchSummaryViewToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onToggle(viewStyle === 'compact' ? 'full' : 'compact')}
      className="flex items-center gap-2"
    >
      <Layout className="h-4 w-4" />
      {viewStyle === 'compact' ? 'Full View' : 'Compact View'}
    </Button>
  );
};

export default MatchSummaryViewToggle;
