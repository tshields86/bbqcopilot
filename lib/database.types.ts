// Supabase Database Types
// These types are manually maintained to match the database schema
// For auto-generated types, run: npx supabase gen types typescript --project-id <project-id>

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          skill_level: 'beginner' | 'intermediate' | 'advanced' | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      grills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand: string | null;
          model: string | null;
          grill_type:
            | 'kamado'
            | 'gas'
            | 'charcoal'
            | 'pellet'
            | 'offset'
            | 'kettle'
            | 'electric'
            | 'other';
          notes: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          brand?: string | null;
          model?: string | null;
          grill_type:
            | 'kamado'
            | 'gas'
            | 'charcoal'
            | 'pellet'
            | 'offset'
            | 'kettle'
            | 'electric'
            | 'other';
          notes?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          brand?: string | null;
          model?: string | null;
          grill_type?:
            | 'kamado'
            | 'gas'
            | 'charcoal'
            | 'pellet'
            | 'offset'
            | 'kettle'
            | 'electric'
            | 'other';
          notes?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      accessories: {
        Row: {
          id: string;
          grill_id: string;
          name: string;
          accessory_type:
            | 'rotisserie'
            | 'griddle'
            | 'pizza_stone'
            | 'soapstone'
            | 'smoking_stone'
            | 'grill_expander'
            | 'heat_deflector'
            | 'cold_smoker'
            | 'thermometer'
            | 'cover'
            | 'other';
          brand: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          grill_id: string;
          name: string;
          accessory_type:
            | 'rotisserie'
            | 'griddle'
            | 'pizza_stone'
            | 'soapstone'
            | 'smoking_stone'
            | 'grill_expander'
            | 'heat_deflector'
            | 'cold_smoker'
            | 'thermometer'
            | 'cover'
            | 'other';
          brand?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          grill_id?: string;
          name?: string;
          accessory_type?:
            | 'rotisserie'
            | 'griddle'
            | 'pizza_stone'
            | 'soapstone'
            | 'smoking_stone'
            | 'grill_expander'
            | 'heat_deflector'
            | 'cold_smoker'
            | 'thermometer'
            | 'cover'
            | 'other';
          brand?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'accessories_grill_id_fkey';
            columns: ['grill_id'];
            isOneToOne: false;
            referencedRelation: 'grills';
            referencedColumns: ['id'];
          },
        ];
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          grill_id: string | null;
          title: string;
          description: string | null;
          proteins: Json;
          servings: number | null;
          total_time_minutes: number | null;
          difficulty: 'easy' | 'medium' | 'hard' | null;
          recipe_data: Json;
          ai_conversation: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          grill_id?: string | null;
          title: string;
          description?: string | null;
          proteins?: Json;
          servings?: number | null;
          total_time_minutes?: number | null;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          recipe_data: Json;
          ai_conversation?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          grill_id?: string | null;
          title?: string;
          description?: string | null;
          proteins?: Json;
          servings?: number | null;
          total_time_minutes?: number | null;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          recipe_data?: Json;
          ai_conversation?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipes_grill_id_fkey';
            columns: ['grill_id'];
            isOneToOne: false;
            referencedRelation: 'grills';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          recipe_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      cook_logs: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string | null;
          cooked_at: string;
          rating: number | null;
          notes: string | null;
          what_worked: string | null;
          what_to_improve: string | null;
          photos: string[];
          weather_conditions: Json | null;
          actual_time_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          recipe_id?: string | null;
          cooked_at?: string;
          rating?: number | null;
          notes?: string | null;
          what_worked?: string | null;
          what_to_improve?: string | null;
          photos?: string[];
          weather_conditions?: Json | null;
          actual_time_minutes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string | null;
          cooked_at?: string;
          rating?: number | null;
          notes?: string | null;
          what_worked?: string | null;
          what_to_improve?: string | null;
          photos?: string[];
          weather_conditions?: Json | null;
          actual_time_minutes?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cook_logs_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      user_usage: {
        Row: {
          id: string;
          user_id: string;
          period_start: string;
          recipes_generated: number;
          clarifications_used: number;
          last_request_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period_start: string;
          recipes_generated?: number;
          clarifications_used?: number;
          last_request_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          period_start?: string;
          recipes_generated?: number;
          clarifications_used?: number;
          last_request_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: 'free' | 'pro' | 'unlimited';
          monthly_recipe_limit: number;
          daily_recipe_limit: number;
          started_at: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: 'free' | 'pro' | 'unlimited';
          monthly_recipe_limit?: number;
          daily_recipe_limit?: number;
          started_at?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: 'free' | 'pro' | 'unlimited';
          monthly_recipe_limit?: number;
          daily_recipe_limit?: number;
          started_at?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_recipe_usage: {
        Args: {
          p_user_id: string;
          p_period_start: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      grill_type:
        | 'kamado'
        | 'gas'
        | 'charcoal'
        | 'pellet'
        | 'offset'
        | 'kettle'
        | 'electric'
        | 'other';
      accessory_type:
        | 'rotisserie'
        | 'griddle'
        | 'pizza_stone'
        | 'soapstone'
        | 'smoking_stone'
        | 'grill_expander'
        | 'heat_deflector'
        | 'cold_smoker'
        | 'thermometer'
        | 'cover'
        | 'other';
      difficulty: 'easy' | 'medium' | 'hard';
      skill_level: 'beginner' | 'intermediate' | 'advanced';
      subscription_tier: 'free' | 'pro' | 'unlimited';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for Supabase queries
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
