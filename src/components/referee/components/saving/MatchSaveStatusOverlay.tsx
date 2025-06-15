
import React from "react";
import { Loader2, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useMatchSaveStatus } from "../../hooks/useMatchSaveStatus";

const phaseIcons: Record<string, React.ReactNode> = {
  validating: <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />,
  saving: <Loader2 className="h-8 w-8 animate-spin text-blue-600" />,
  cache: <RefreshCw className="h-8 w-8 animate-spin text-yellow-400" />,
  refreshing: <RefreshCw className="h-8 w-8 animate-spin text-green-400" />,
  success: <CheckCircle className="h-8 w-8 text-green-600" />,
  error: <AlertTriangle className="h-8 w-8 text-red-500" />,
  idle: null,
};

function getDefaultStatus(phase: string) {
  switch (phase) {
    case "validating":
      return "Validating match data...";
    case "saving":
      return "Saving match and player stats...";
    case "cache":
      return "Syncing cache and updating database...";
    case "refreshing":
      return "Refreshing local data...";
    case "success":
      return "Match Saved Successfully!";
    case "error":
      return "Save Failed!";
    default:
      return "";
  }
}

const MatchSaveStatusOverlay: React.FC = () => {
  const { phase, progress, statusMessage, errorMessage, reset } = useMatchSaveStatus();

  if (phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 shadow-lg rounded-xl px-8 py-7 min-w-[320px] flex flex-col items-center gap-3 relative animate-scale-in">
        {phase !== "idle" && (
          <div className="mb-2">{phaseIcons[phase]}</div>
        )}

        <div className="text-lg font-semibold text-center">
          {statusMessage || getDefaultStatus(phase)}
        </div>

        {(progress >= 0 && progress < 100 && phase !== "success") && (
          <div className="w-full h-2 rounded bg-muted/40 overflow-hidden">
            <div
              className={`h-2 rounded ${phase === "error" ? "bg-red-500" : "bg-primary/60"}`}
              style={{ width: `${progress}%`, transition: "width 0.5s" }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        {phase === "error" && errorMessage && (
          <div className="text-xs text-red-600 mt-2 text-center">{errorMessage}</div>
        )}

        {(phase === "success" || phase === "error") && (
          <button
            className="mt-3 text-xs bg-zinc-100 dark:bg-zinc-800 rounded px-3 py-1 shadow hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            onClick={reset}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchSaveStatusOverlay;
