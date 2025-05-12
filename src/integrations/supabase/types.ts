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
      appliances: {
        Row: {
          category: string
          home_profile_id: string
          id: string
          name: string
          notes: string | null
          purchase_date: string
          warranty_document: string | null
          warranty_expiration_date: string | null
        }
        Insert: {
          category: string
          home_profile_id: string
          id?: string
          name: string
          notes?: string | null
          purchase_date: string
          warranty_document?: string | null
          warranty_expiration_date?: string | null
        }
        Update: {
          category?: string
          home_profile_id?: string
          id?: string
          name?: string
          notes?: string | null
          purchase_date?: string
          warranty_document?: string | null
          warranty_expiration_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appliances_home_profile_id_fkey"
            columns: ["home_profile_id"]
            isOneToOne: false
            referencedRelation: "home_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      home_profiles: {
        Row: {
          address: string
          construction_year: number
          id: string
          images: string[] | null
          user_id: string
        }
        Insert: {
          address: string
          construction_year: number
          id?: string
          images?: string[] | null
          user_id: string
        }
        Update: {
          address?: string
          construction_year?: number
          id?: string
          images?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      maintenance_reminders: {
        Row: {
          appliance_id: string
          completed: boolean | null
          description: string | null
          due_date: string
          id: string
          recurrence_pattern: string | null
          recurring: boolean | null
          title: string
        }
        Insert: {
          appliance_id: string
          completed?: boolean | null
          description?: string | null
          due_date: string
          id?: string
          recurrence_pattern?: string | null
          recurring?: boolean | null
          title: string
        }
        Update: {
          appliance_id?: string
          completed?: boolean | null
          description?: string | null
          due_date?: string
          id?: string
          recurrence_pattern?: string | null
          recurring?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_reminders_appliance_id_fkey"
            columns: ["appliance_id"]
            isOneToOne: false
            referencedRelation: "appliances"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      service_records: {
        Row: {
          appliance_id: string
          cost: number
          date: string
          id: string
          invoice_document: string | null
          notes: string | null
          provider_contact: string | null
          provider_name: string
          service_type: string
        }
        Insert: {
          appliance_id: string
          cost: number
          date: string
          id?: string
          invoice_document?: string | null
          notes?: string | null
          provider_contact?: string | null
          provider_name: string
          service_type: string
        }
        Update: {
          appliance_id?: string
          cost?: number
          date?: string
          id?: string
          invoice_document?: string | null
          notes?: string | null
          provider_contact?: string | null
          provider_name?: string
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_records_appliance_id_fkey"
            columns: ["appliance_id"]
            isOneToOne: false
            referencedRelation: "appliances"
            referencedColumns: ["id"]
          },
        ]
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
