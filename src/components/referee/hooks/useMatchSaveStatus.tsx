
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

type SavePhase = "idle" | "validating" | "saving" | "success" | "error" | "cache" | "refreshing";
interface MatchSaveStatusContextType {
  phase: SavePhase;
  progress: number; // 0-100 (where relevant), or -1 for indeterminate
  statusMessage: string;
  errorMessage?: string;
  setPhase: (phase: SavePhase, opts?: { statusMessage?: string; progress?: number; errorMessage?: string }) => void;
  reset: () => void;
}

const MatchSaveStatusContext = createContext<MatchSaveStatusContextType | undefined>(undefined);

export const MatchSaveStatusProvider = ({ children }: { children: ReactNode }) => {
  const [phase, setPhaseState] = useState<SavePhase>("idle");
  const [progress, setProgress] = useState<number>(-1);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const setPhase = useCallback(
    (
      nextPhase: SavePhase,
      opts?: { statusMessage?: string; progress?: number; errorMessage?: string }
    ) => {
      setPhaseState(nextPhase);
      if (opts?.statusMessage !== undefined) setStatusMessage(opts.statusMessage);
      if (typeof opts?.progress === "number") setProgress(opts.progress);
      if (opts?.errorMessage !== undefined) setErrorMessage(opts.errorMessage);
      else if (nextPhase !== "error") setErrorMessage(undefined);
    },
    []
  );

  const reset = useCallback(() => {
    setPhaseState("idle");
    setProgress(-1);
    setStatusMessage("");
    setErrorMessage(undefined);
  }, []);

  return (
    <MatchSaveStatusContext.Provider
      value={{ phase, progress, statusMessage, errorMessage, setPhase, reset }}
    >
      {children}
    </MatchSaveStatusContext.Provider>
  );
};

export function useMatchSaveStatus() {
  const ctx = useContext(MatchSaveStatusContext);
  if (!ctx) throw new Error("useMatchSaveStatus must be used within MatchSaveStatusProvider");
  return ctx;
}
