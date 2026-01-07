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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      job_applications: {
        Row: {
          applicant_id: string
          created_at: string
          id: string
          job_id: string
          message: string | null
          status: string | null
        }
        Insert: {
          applicant_id: string
          created_at?: string
          id?: string
          job_id: string
          message?: string | null
          status?: string | null
        }
        Update: {
          applicant_id?: string
          created_at?: string
          id?: string
          job_id?: string
          message?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_to: string | null
          budget: number
          category: Database["public"]["Enums"]["job_category"]
          created_at: string
          description: string
          estimated_date: string | null
          id: string
          province: Database["public"]["Enums"]["province"]
          publisher_id: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget: number
          category: Database["public"]["Enums"]["job_category"]
          created_at?: string
          description: string
          estimated_date?: string | null
          id?: string
          province: Database["public"]["Enums"]["province"]
          publisher_id: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget?: number
          category?: Database["public"]["Enums"]["job_category"]
          created_at?: string
          description?: string
          estimated_date?: string | null
          id?: string
          province?: Database["public"]["Enums"]["province"]
          publisher_id?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"] | null
          address: string | null
          birth_date: string | null
          collection_method: string | null
          created_at: string
          dni_nie: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          payment_method: string | null
          phone: string | null
          province: Database["public"]["Enums"]["province"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          address?: string | null
          birth_date?: string | null
          collection_method?: string | null
          created_at?: string
          dni_nie?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          payment_method?: string | null
          phone?: string | null
          province?: Database["public"]["Enums"]["province"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          address?: string | null
          birth_date?: string | null
          collection_method?: string | null
          created_at?: string
          dni_nie?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          payment_method?: string | null
          phone?: string | null
          province?: Database["public"]["Enums"]["province"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "pending"
      app_role: "admin" | "user"
      job_category:
        | "limpieza"
        | "reparaciones"
        | "mudanzas"
        | "jardineria"
        | "cuidado_personas"
        | "clases"
        | "tecnologia"
        | "otros"
      job_status: "open" | "assigned" | "approved" | "completed" | "cancelled"
      province:
        | "alava"
        | "albacete"
        | "alicante"
        | "almeria"
        | "asturias"
        | "avila"
        | "badajoz"
        | "barcelona"
        | "burgos"
        | "caceres"
        | "cadiz"
        | "cantabria"
        | "castellon"
        | "ciudad_real"
        | "cordoba"
        | "cuenca"
        | "girona"
        | "granada"
        | "guadalajara"
        | "guipuzcoa"
        | "huelva"
        | "huesca"
        | "islas_baleares"
        | "jaen"
        | "la_coruna"
        | "la_rioja"
        | "las_palmas"
        | "leon"
        | "lleida"
        | "lugo"
        | "madrid"
        | "malaga"
        | "murcia"
        | "navarra"
        | "ourense"
        | "palencia"
        | "pontevedra"
        | "salamanca"
        | "santa_cruz_tenerife"
        | "segovia"
        | "sevilla"
        | "soria"
        | "tarragona"
        | "teruel"
        | "toledo"
        | "valencia"
        | "valladolid"
        | "vizcaya"
        | "zamora"
        | "zaragoza"
        | "ceuta"
        | "melilla"
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
    Enums: {
      account_status: ["active", "suspended", "pending"],
      app_role: ["admin", "user"],
      job_category: [
        "limpieza",
        "reparaciones",
        "mudanzas",
        "jardineria",
        "cuidado_personas",
        "clases",
        "tecnologia",
        "otros",
      ],
      job_status: ["open", "assigned", "approved", "completed", "cancelled"],
      province: [
        "alava",
        "albacete",
        "alicante",
        "almeria",
        "asturias",
        "avila",
        "badajoz",
        "barcelona",
        "burgos",
        "caceres",
        "cadiz",
        "cantabria",
        "castellon",
        "ciudad_real",
        "cordoba",
        "cuenca",
        "girona",
        "granada",
        "guadalajara",
        "guipuzcoa",
        "huelva",
        "huesca",
        "islas_baleares",
        "jaen",
        "la_coruna",
        "la_rioja",
        "las_palmas",
        "leon",
        "lleida",
        "lugo",
        "madrid",
        "malaga",
        "murcia",
        "navarra",
        "ourense",
        "palencia",
        "pontevedra",
        "salamanca",
        "santa_cruz_tenerife",
        "segovia",
        "sevilla",
        "soria",
        "tarragona",
        "teruel",
        "toledo",
        "valencia",
        "valladolid",
        "vizcaya",
        "zamora",
        "zaragoza",
        "ceuta",
        "melilla",
      ],
    },
  },
} as const
