export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auth_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      favicon: {
        Row: {
          created_at: string
          logoURL: number
        }
        Insert: {
          created_at?: string
          logoURL?: number
        }
        Update: {
          created_at?: string
          logoURL?: number
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          __id__: string
          away_score: number | null
          away_team_id: string | null
          created_at: string | null
          date: string | null
          home_score: number | null
          home_team_id: string | null
          id: number
          match_date: string
          matchNo: number | null
          status: string
          team1: string | null
          team2: string | null
          time: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          __id__: string
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          date?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: number
          match_date: string
          matchNo?: number | null
          status?: string
          team1?: string | null
          team2?: string | null
          time?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          __id__?: string
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          date?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: number
          match_date?: string
          matchNo?: number | null
          status?: string
          team1?: string | null
          team2?: string | null
          time?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
          {
            foreignKeyName: "fk_fixtures_away_team"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
          {
            foreignKeyName: "fk_fixtures_home_team"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
        ]
      }
      match_events: {
        Row: {
          card_type: string | null
          created_at: string | null
          description: string
          event_time: number
          event_type: string
          fixture_id: number
          id: number
          own_goal: boolean | null
          player_name: string
          team_id: string
        }
        Insert: {
          card_type?: string | null
          created_at?: string | null
          description: string
          event_time: number
          event_type: string
          fixture_id: number
          id?: number
          own_goal?: boolean | null
          player_name: string
          team_id: string
        }
        Update: {
          card_type?: string | null
          created_at?: string | null
          description?: string
          event_time?: number
          event_type?: string
          fixture_id?: number
          id?: number
          own_goal?: boolean | null
          player_name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_events_fixture"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_match_events_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
        ]
      }
      members: {
        Row: {
          __id__: string
          assists: number | null
          created_at: string | null
          goals: number | null
          id: number
          last_updated_by: string | null
          matches_played: number | null
          name: string | null
          nickname: string | null
          number: string | null
          position: string | null
          ProfileURL: string | null
          red_cards: number | null
          role: string | null
          sync_status: string | null
          team_id: string | null
          total_minutes_played: number | null
          updated_at: string | null
          validation_status: string | null
          yellow_cards: number | null
        }
        Insert: {
          __id__: string
          assists?: number | null
          created_at?: string | null
          goals?: number | null
          id?: number
          last_updated_by?: string | null
          matches_played?: number | null
          name?: string | null
          nickname?: string | null
          number?: string | null
          position?: string | null
          ProfileURL?: string | null
          red_cards?: number | null
          role?: string | null
          sync_status?: string | null
          team_id?: string | null
          total_minutes_played?: number | null
          updated_at?: string | null
          validation_status?: string | null
          yellow_cards?: number | null
        }
        Update: {
          __id__?: string
          assists?: number | null
          created_at?: string | null
          goals?: number | null
          id?: number
          last_updated_by?: string | null
          matches_played?: number | null
          name?: string | null
          nickname?: string | null
          number?: string | null
          position?: string | null
          ProfileURL?: string | null
          red_cards?: number | null
          role?: string | null
          sync_status?: string | null
          team_id?: string | null
          total_minutes_played?: number | null
          updated_at?: string | null
          validation_status?: string | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_members_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
          {
            foreignKeyName: "members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
        ]
      }
      operation_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: number
          ip_address: string | null
          operation_type: string
          payload: Json | null
          record_id: string | null
          result: Json | null
          success: boolean | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          ip_address?: string | null
          operation_type: string
          payload?: Json | null
          record_id?: string | null
          result?: Json | null
          success?: boolean | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          ip_address?: string | null
          operation_type?: string
          payload?: Json | null
          record_id?: string | null
          result?: Json | null
          success?: boolean | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      player_time_tracking: {
        Row: {
          created_at: string | null
          fixture_id: number
          id: number
          periods: Json | null
          player_id: number
          player_name: string
          team_id: number
          total_minutes: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fixture_id: number
          id?: number
          periods?: Json | null
          player_id: number
          player_name: string
          team_id: number
          total_minutes?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fixture_id?: number
          id?: number
          periods?: Json | null
          player_id?: number
          player_name?: string
          team_id?: number
          total_minutes?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          __id__: string
          captain: string | null
          color: string | null
          drawn: number | null
          founded: string | null
          goal_difference: number | null
          goals_against: number | null
          goals_for: number | null
          id: number
          logo: string | null
          logoURL: string | null
          lost: number | null
          name: string | null
          played: number | null
          points: number | null
          position: number | null
          previous_position: number | null
          won: number | null
        }
        Insert: {
          __id__: string
          captain?: string | null
          color?: string | null
          drawn?: number | null
          founded?: string | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: number
          logo?: string | null
          logoURL?: string | null
          lost?: number | null
          name?: string | null
          played?: number | null
          points?: number | null
          position?: number | null
          previous_position?: number | null
          won?: number | null
        }
        Update: {
          __id__?: string
          captain?: string | null
          color?: string | null
          drawn?: number | null
          founded?: string | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: number
          logo?: string | null
          logoURL?: string | null
          lost?: number | null
          name?: string | null
          played?: number | null
          points?: number | null
          position?: number | null
          previous_position?: number | null
          won?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_enhanced_match_summary: {
        Args: { p_fixture_id: number }
        Returns: {
          fixture_id: number
          home_team_id: string
          away_team_id: string
          home_score: number
          away_score: number
          goals: Json
          cards: Json
          player_times: Json
          summary_stats: Json
          timeline_events: Json
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      is_authenticated_referee: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_operation: {
        Args: {
          p_operation_type: string
          p_table_name?: string
          p_record_id?: string
          p_payload?: Json
          p_result?: Json
          p_error_message?: string
          p_success?: boolean
        }
        Returns: string
      }
      safe_update_member_stats: {
        Args: {
          p_member_id: number
          p_goals?: number
          p_assists?: number
          p_yellow_cards?: number
          p_red_cards?: number
          p_total_minutes_played?: number
          p_matches_played?: number
        }
        Returns: Json
      }
      validate_fixture_score: {
        Args: { home_score: number; away_score: number }
        Returns: boolean
      }
      validate_player_name: {
        Args: { player_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
