export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      coordination_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          match_coordination_id: string
          referee_id: string | null
          timestamp: string
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          match_coordination_id: string
          referee_id?: string | null
          timestamp?: string
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          match_coordination_id?: string
          referee_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordination_events_match_coordination_id_fkey"
            columns: ["match_coordination_id"]
            isOneToOne: false
            referencedRelation: "match_coordination"
            referencedColumns: ["id"]
          },
        ]
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
      image_metadata: {
        Row: {
          alt_text: string | null
          bucket_id: string
          created_at: string | null
          file_size: number
          format: string
          height: number
          id: string
          object_path: string
          original_url: string
          updated_at: string | null
          variants: Json | null
          width: number
        }
        Insert: {
          alt_text?: string | null
          bucket_id: string
          created_at?: string | null
          file_size: number
          format: string
          height: number
          id?: string
          object_path: string
          original_url: string
          updated_at?: string | null
          variants?: Json | null
          width: number
        }
        Update: {
          alt_text?: string | null
          bucket_id?: string
          created_at?: string | null
          file_size?: number
          format?: string
          height?: number
          id?: string
          object_path?: string
          original_url?: string
          updated_at?: string | null
          variants?: Json | null
          width?: number
        }
        Relationships: []
      }
      league_table_operations: {
        Row: {
          away_score: number
          away_team_id: string
          created_at: string | null
          fixture_id: number
          home_score: number
          home_team_id: string
          id: string
          operation_hash: string
          operation_type: string
        }
        Insert: {
          away_score: number
          away_team_id: string
          created_at?: string | null
          fixture_id: number
          home_score: number
          home_team_id: string
          id?: string
          operation_hash: string
          operation_type: string
        }
        Update: {
          away_score?: number
          away_team_id?: string
          created_at?: string | null
          fixture_id?: number
          home_score?: number
          home_team_id?: string
          id?: string
          operation_hash?: string
          operation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_table_operations_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      match_coordination: {
        Row: {
          completion_summary: Json | null
          coordinator_referee_id: string | null
          created_at: string
          final_review_data: Json | null
          fixture_id: number
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          completion_summary?: Json | null
          coordinator_referee_id?: string | null
          created_at?: string
          final_review_data?: Json | null
          fixture_id: number
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          completion_summary?: Json | null
          coordinator_referee_id?: string | null
          created_at?: string
          final_review_data?: Json | null
          fixture_id?: number
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_coordination_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: true
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          affected_team_id: string | null
          card_type: string | null
          created_at: string | null
          description: string
          event_time: number
          event_type: string
          fixture_id: number
          id: number
          is_own_goal: boolean
          player_name: string
          scoring_team_id: string | null
          team_id: string
        }
        Insert: {
          affected_team_id?: string | null
          card_type?: string | null
          created_at?: string | null
          description: string
          event_time: number
          event_type: string
          fixture_id: number
          id?: number
          is_own_goal?: boolean
          player_name: string
          scoring_team_id?: string | null
          team_id: string
        }
        Update: {
          affected_team_id?: string | null
          card_type?: string | null
          created_at?: string | null
          description?: string
          event_time?: number
          event_type?: string
          fixture_id?: number
          id?: number
          is_own_goal?: boolean
          player_name?: string
          scoring_team_id?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_events_affected_team"
            columns: ["affected_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
          },
          {
            foreignKeyName: "fk_match_events_fixture"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_match_events_scoring_team"
            columns: ["scoring_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["__id__"]
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
      match_referee_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assigned_role: string
          completion_timestamp: string | null
          created_at: string
          fixture_id: number
          id: string
          notes: string | null
          referee_id: string
          responsibilities: string[] | null
          status: string
          team_assignment: string | null
          updated_at: string
          workflow_mode: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_role: string
          completion_timestamp?: string | null
          created_at?: string
          fixture_id: number
          id?: string
          notes?: string | null
          referee_id: string
          responsibilities?: string[] | null
          status?: string
          team_assignment?: string | null
          updated_at?: string
          workflow_mode: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_role?: string
          completion_timestamp?: string | null
          created_at?: string
          fixture_id?: number
          id?: string
          notes?: string | null
          referee_id?: string
          responsibilities?: string[] | null
          status?: string
          team_assignment?: string | null
          updated_at?: string
          workflow_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_referee_assignments_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      match_workflow_config: {
        Row: {
          config_data: Json | null
          configured_by: string
          created_at: string
          fixture_id: number
          id: string
          updated_at: string
          workflow_mode: string
        }
        Insert: {
          config_data?: Json | null
          configured_by: string
          created_at?: string
          fixture_id: number
          id?: string
          updated_at?: string
          workflow_mode: string
        }
        Update: {
          config_data?: Json | null
          configured_by?: string
          created_at?: string
          fixture_id?: number
          id?: string
          updated_at?: string
          workflow_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_workflow_config_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: true
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      member_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          member_id: number
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_month: string
          payment_status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          member_id: number
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_month: string
          payment_status: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          member_id?: number
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_month?: string
          payment_status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          __id__: string
          assists: number | null
          avatar_metadata_id: string | null
          avatar_variants: Json | null
          created_at: string | null
          goals: number | null
          id: number
          is_fee_exempt: boolean
          last_time_sync: string | null
          last_updated_by: string | null
          line_id: string | null
          line_name: string | null
          matches_played: number | null
          name: string | null
          nickname: string | null
          number: string | null
          optimized_avatar_url: string | null
          position: string | null
          ProfileURL: string | null
          real_name: string | null
          red_cards: number | null
          role: string | null
          sync_status: string | null
          team_id: string | null
          total_minutes_played: number | null
          total_minutes_this_season: number | null
          updated_at: string | null
          validation_status: string | null
          yellow_cards: number | null
        }
        Insert: {
          __id__: string
          assists?: number | null
          avatar_metadata_id?: string | null
          avatar_variants?: Json | null
          created_at?: string | null
          goals?: number | null
          id?: number
          is_fee_exempt?: boolean
          last_time_sync?: string | null
          last_updated_by?: string | null
          line_id?: string | null
          line_name?: string | null
          matches_played?: number | null
          name?: string | null
          nickname?: string | null
          number?: string | null
          optimized_avatar_url?: string | null
          position?: string | null
          ProfileURL?: string | null
          real_name?: string | null
          red_cards?: number | null
          role?: string | null
          sync_status?: string | null
          team_id?: string | null
          total_minutes_played?: number | null
          total_minutes_this_season?: number | null
          updated_at?: string | null
          validation_status?: string | null
          yellow_cards?: number | null
        }
        Update: {
          __id__?: string
          assists?: number | null
          avatar_metadata_id?: string | null
          avatar_variants?: Json | null
          created_at?: string | null
          goals?: number | null
          id?: number
          is_fee_exempt?: boolean
          last_time_sync?: string | null
          last_updated_by?: string | null
          line_id?: string | null
          line_name?: string | null
          matches_played?: number | null
          name?: string | null
          nickname?: string | null
          number?: string | null
          optimized_avatar_url?: string | null
          position?: string | null
          ProfileURL?: string | null
          real_name?: string | null
          red_cards?: number | null
          role?: string | null
          sync_status?: string | null
          team_id?: string | null
          total_minutes_played?: number | null
          total_minutes_this_season?: number | null
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
            foreignKeyName: "members_avatar_metadata_id_fkey"
            columns: ["avatar_metadata_id"]
            isOneToOne: false
            referencedRelation: "image_metadata"
            referencedColumns: ["id"]
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
      modification_logs: {
        Row: {
          action: string
          created_at: string
          event_type: string
          fixture_id: number
          id: string
          new_data: Json | null
          notes: string | null
          prev_data: Json
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          event_type: string
          fixture_id: number
          id?: string
          new_data?: Json | null
          notes?: string | null
          prev_data: Json
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          event_type?: string
          fixture_id?: number
          id?: string
          new_data?: Json | null
          notes?: string | null
          prev_data?: Json
          user_id?: string
        }
        Relationships: []
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
      referee_assignments: {
        Row: {
          assigned_role: string
          completion_timestamp: string | null
          created_at: string
          data: Json | null
          id: string
          match_coordination_id: string
          notes: string | null
          referee_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_role: string
          completion_timestamp?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          match_coordination_id: string
          notes?: string | null
          referee_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_role?: string
          completion_timestamp?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          match_coordination_id?: string
          notes?: string | null
          referee_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referee_assignments_match_coordination_id_fkey"
            columns: ["match_coordination_id"]
            isOneToOne: false
            referencedRelation: "match_coordination"
            referencedColumns: ["id"]
          },
        ]
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
          logo_metadata_id: string | null
          logo_variants: Json | null
          logoURL: string | null
          lost: number | null
          name: string | null
          optimized_logo_url: string | null
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
          logo_metadata_id?: string | null
          logo_variants?: Json | null
          logoURL?: string | null
          lost?: number | null
          name?: string | null
          optimized_logo_url?: string | null
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
          logo_metadata_id?: string | null
          logo_variants?: Json | null
          logoURL?: string | null
          lost?: number | null
          name?: string | null
          optimized_logo_url?: string | null
          played?: number | null
          points?: number | null
          position?: number | null
          previous_position?: number | null
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_logo_metadata_id_fkey"
            columns: ["logo_metadata_id"]
            isOneToOne: false
            referencedRelation: "image_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_referee_to_role: {
        Args: {
          p_assigned_role: string
          p_fixture_id: number
          p_responsibilities?: string[]
          p_team_assignment?: string
          p_workflow_mode: string
        }
        Returns: Json
      }
      calculate_cumulative_player_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_orphaned_images: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      complete_referee_assignment: {
        Args: { p_assignment_id: string; p_completion_notes?: string }
        Returns: Json
      }
      detect_sync_discrepancies: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      finalize_match_coordination: {
        Args: { p_coordination_id: string; p_final_review_data?: Json }
        Returns: Json
      }
      generate_league_operation_hash: {
        Args: {
          p_away_score: number
          p_fixture_id: number
          p_home_score: number
          p_operation_type: string
        }
        Returns: string
      }
      get_coordination_with_assignments: {
        Args: { p_fixture_id: number }
        Returns: {
          assignments: Json
          completion_status: Json
          fixture_id: number
          user_assignments: Json
          workflow_mode: string
        }[]
      }
      get_enhanced_match_summary: {
        Args: { p_fixture_id: number }
        Returns: {
          away_score: number
          away_team_id: string
          cards: Json
          fixture_id: number
          goals: Json
          home_score: number
          home_team_id: string
          player_times: Json
          summary_stats: Json
          timeline_events: Json
        }[]
      }
      get_enhanced_match_summary_v2: {
        Args: { p_fixture_id: number }
        Returns: {
          away_score: number
          away_team_id: string
          cards: Json
          fixture_id: number
          goals: Json
          home_score: number
          home_team_id: string
          own_goals_summary: Json
          player_times: Json
          summary_stats: Json
          timeline_events: Json
        }[]
      }
      get_fixture_all_assignments: {
        Args: { p_fixture_id: number }
        Returns: {
          assigned_at: string
          assigned_role: string
          assignment_id: string
          referee_id: string
          responsibilities: string[]
          status: string
          team_assignment: string
          workflow_mode: string
        }[]
      }
      get_match_coordination_status: {
        Args: { p_fixture_id: number }
        Returns: {
          assignments: Json
          completion_summary: Json
          coordination_id: string
          fixture_id: number
          ready_for_review: boolean
          status: string
        }[]
      }
      get_member_status: {
        Args: { p_member_id: number; p_reference_month?: string }
        Returns: string
      }
      get_monthly_payment_summary: {
        Args: { target_month: string }
        Returns: {
          paid_count: number
          payment_month: string
          total_amount: number
          total_members: number
          unpaid_count: number
        }[]
      }
      get_payment_history: {
        Args: { p_member_id: number; p_months_back?: number }
        Returns: Json
      }
      get_player_stats_sync_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_sync_health_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_fixture_assignments: {
        Args: { p_fixture_id: number }
        Returns: {
          assigned_role: string
          assignment_id: string
          responsibilities: string[]
          status: string
          team_assignment: string
          workflow_mode: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      initialize_monthly_payments: {
        Args: { target_month: string }
        Returns: Json
      }
      initialize_referee_assignments: {
        Args: { p_fixture_id: number; p_workflow_mode: string }
        Returns: Json
      }
      is_authenticated_referee: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_match_event_team_mapping: {
        Args: {
          p_event_type: string
          p_fixture_team_ids: Json
          p_resolved_team_ids: Json
        }
        Returns: undefined
      }
      log_operation: {
        Args: {
          p_error_message?: string
          p_operation_type: string
          p_payload?: Json
          p_record_id?: string
          p_result?: Json
          p_success?: boolean
          p_table_name?: string
        }
        Returns: string
      }
      manual_sync_player_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      safe_update_member_stats: {
        Args: {
          p_assists?: number
          p_goals?: number
          p_matches_played?: number
          p_member_id: number
          p_red_cards?: number
          p_total_minutes_played?: number
          p_yellow_cards?: number
        }
        Returns: Json
      }
      sync_all_match_participation: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_match_participation: {
        Args: { p_fixture_id: number }
        Returns: Json
      }
      validate_bulk_payment_import: {
        Args: { p_records: Json }
        Returns: Json
      }
      validate_fixture_score: {
        Args: { away_score: number; home_score: number }
        Returns: boolean
      }
      validate_player_name: {
        Args: { player_name: string }
        Returns: boolean
      }
      validate_player_stats_with_participation: {
        Args: Record<PropertyKey, never>
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
