import { supabase } from "@/integrations/supabase/client";

export interface Season {
  id: string;
  season_number: number;
  name: string;
  is_active: boolean;
  is_current_default: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export const seasonsService = {
  async getAll(): Promise<Season[]> {
    const { data, error } = await supabase
      .from("seasons" as any)
      .select("*")
      .order("season_number", { ascending: false });
    if (error) throw error;
    return (data as unknown as Season[]) || [];
  },

  async setCurrentSeason(seasonId: string) {
    const { data, error } = await supabase.rpc("set_current_season" as any, {
      p_season_id: seasonId,
    });
    if (error) throw error;
    return data;
  },

  async cloneSeason(params: {
    sourceSeasonId: string;
    targetName: string;
    targetNumber: number;
  }) {
    const { data, error } = await supabase.rpc("clone_season" as any, {
      p_source_season_id: params.sourceSeasonId,
      p_target_season_name: params.targetName,
      p_target_season_number: params.targetNumber,
    });
    if (error) throw error;
    return data;
  },

  async updateSeasonName(seasonId: string, name: string) {
    const { data, error } = await (supabase
      .from("seasons" as any) as any)
      .update({ name })
      .eq("id", seasonId)
      .select()
      .single();
    if (error) throw error;
    return data as Season;
  },
};