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
          match_time: string
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
          match_time?: string
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
          match_time?: string
          matchNo?: number | null
          status?: string
          team1?: string | null
          team2?: string | null
          time?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      match_events: {
        Row: {
          created_at: string | null
          description: string
          event_time: number
          event_type: string
          fixture_id: number
          id: number
          player_name: string
          team_id: number
        }
        Insert: {
          created_at?: string | null
          description: string
          event_time: number
          event_type: string
          fixture_id: number
          id?: number
          player_name: string
          team_id: number
        }
        Update: {
          created_at?: string | null
          description?: string
          event_time?: number
          event_type?: string
          fixture_id?: number
          id?: number
          player_name?: string
          team_id?: number
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
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          __id__: string
          assists: number | null
          goals: number | null
          id: number
          name: string | null
          nickname: string | null
          number: string | null
          position: string | null
          role: string | null
          team_id: string | null
        }
        Insert: {
          __id__: string
          assists?: number | null
          goals?: number | null
          id?: number
          name?: string | null
          nickname?: string | null
          number?: string | null
          position?: string | null
          role?: string | null
          team_id?: string | null
        }
        Update: {
          __id__?: string
          assists?: number | null
          goals?: number | null
          id?: number
          name?: string | null
          nickname?: string | null
          number?: string | null
          position?: string | null
          role?: string | null
          team_id?: string | null
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
          won?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
