import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { seasonsService, type Season } from "@/services/seasonsService";
import {
  getCurrentSeasonId,
  setCurrentSeasonId as setStoreSeasonId,
} from "@/lib/seasonStore";

interface SeasonContextValue {
  seasons: Season[];
  currentSeason: Season | null;
  currentSeasonId: string | null;
  defaultSeason: Season | null;
  isViewingHistorical: boolean;
  loading: boolean;
  setCurrentSeasonId: (id: string) => void;
  refreshSeasons: () => Promise<void>;
}

const SeasonContext = createContext<SeasonContextValue | undefined>(undefined);

export const useSeason = () => {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error("useSeason must be used within SeasonProvider");
  return ctx;
};

interface SeasonProviderProps {
  children: ReactNode;
}

export const SeasonProvider: React.FC<SeasonProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [currentSeasonId, setCurrentSeasonIdState] = useState<string | null>(
    getCurrentSeasonId()
  );
  const [loading, setLoading] = useState(true);

  const refreshSeasons = useCallback(async () => {
    try {
      const list = await seasonsService.getAll();
      setSeasons(list);

      const stored = getCurrentSeasonId();
      const validStored = stored && list.some((s) => s.id === stored);

      if (!validStored) {
        const defaultSeason =
          list.find((s) => s.is_current_default) || list[0] || null;
        if (defaultSeason) {
          setStoreSeasonId(defaultSeason.id);
          setCurrentSeasonIdState(defaultSeason.id);
        }
      } else {
        setCurrentSeasonIdState(stored);
      }
    } catch (err) {
      console.error("Failed to load seasons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSeasons();
  }, [refreshSeasons]);

  const setCurrentSeasonId = useCallback(
    (id: string) => {
      setStoreSeasonId(id);
      setCurrentSeasonIdState(id);
      // Invalidate all React Query caches so data refetches for the new season
      queryClient.invalidateQueries();
    },
    [queryClient]
  );

  const currentSeason =
    seasons.find((s) => s.id === currentSeasonId) || null;
  const defaultSeason = seasons.find((s) => s.is_current_default) || null;
  const isViewingHistorical =
    !!defaultSeason && !!currentSeason && currentSeason.id !== defaultSeason.id;

  const value: SeasonContextValue = {
    seasons,
    currentSeason,
    currentSeasonId,
    defaultSeason,
    isViewingHistorical,
    loading,
    setCurrentSeasonId,
    refreshSeasons,
  };

  return (
    <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
  );
};