
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";

interface KickoffSectionProps {
  fixture: Fixture;
  className?: string;
}

const KickoffSection = ({ fixture, className = "" }: KickoffSectionProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 hover:bg-green-700 border-green-500';
      case 'live':
        return 'bg-red-600 hover:bg-red-700 border-red-500 animate-pulse';
      case 'scheduled':
        return 'bg-blue-600 hover:bg-blue-700 border-blue-500';
      default:
        return 'bg-muted hover:bg-muted/80 border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Full Time';
      case 'live':
        return 'Live';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className={`relative text-center py-8 px-6 bg-gradient-to-br from-muted/60 via-background/80 to-muted/40 rounded-xl border backdrop-blur-sm ${className}`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Enhanced Match Status */}
        <div className="mb-6">
          <Badge className={`${getStatusColor(fixture.status)} text-white font-bold px-6 py-3 text-base border-2 shadow-lg`}>
            {getStatusText(fixture.status)}
          </Badge>
        </div>

        {/* Enhanced Score or VS */}
        <div className="mb-6">
          {fixture.status === 'completed' ? (
            <div className="space-y-3">
              <div className="text-6xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent drop-shadow-lg">
                {fixture.home_score || 0} - {fixture.away_score || 0}
              </div>
              <p className="text-sm text-muted-foreground font-medium bg-background/60 px-4 py-2 rounded-full inline-block">
                Final Score
              </p>
            </div>
          ) : fixture.status === 'live' ? (
            <div className="space-y-3">
              <div className="text-6xl sm:text-7xl font-black tracking-tight text-red-600 drop-shadow-lg animate-pulse">
                {fixture.home_score || 0} - {fixture.away_score || 0}
              </div>
              <p className="text-sm text-red-600 font-bold animate-pulse bg-red-50 px-4 py-2 rounded-full inline-block border border-red-200">
                LIVE NOW
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-5xl font-black text-muted-foreground/80 tracking-wider">
                VS
              </div>
              <p className="text-sm text-muted-foreground font-medium bg-background/60 px-4 py-2 rounded-full inline-block">
                Kick Off
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Match Date and Time */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 bg-background/60 px-4 py-3 rounded-lg backdrop-blur-sm border border-border/50">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {formatDateDisplay(fixture.match_date)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-background/60 px-4 py-3 rounded-lg backdrop-blur-sm border border-border/50">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {formatTimeDisplay(fixture.match_time)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KickoffSection;
