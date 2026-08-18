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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assistant_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          hostel_id: string
          id: string
          monthly_rent: number
          move_in_date: string
          notes: string | null
          owner_id: string
          ref_id: string | null
          room_type: string
          status: Database["public"]["Enums"]["booking_status"]
          student_email: string | null
          student_id: string
          student_name: string
          student_phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hostel_id: string
          id?: string
          monthly_rent: number
          move_in_date: string
          notes?: string | null
          owner_id: string
          ref_id?: string | null
          room_type?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_email?: string | null
          student_id: string
          student_name: string
          student_phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hostel_id?: string
          id?: string
          monthly_rent?: number
          move_in_date?: string
          notes?: string | null
          owner_id?: string
          ref_id?: string | null
          room_type?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_email?: string | null
          student_id?: string
          student_name?: string
          student_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          category: Database["public"]["Enums"]["complaint_category"]
          created_at: string
          description: string
          hostel_id: string
          id: string
          owner_id: string
          owner_response: string | null
          resolved_at: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description: string
          hostel_id: string
          id?: string
          owner_id: string
          owner_response?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description?: string
          hostel_id?: string
          id?: string
          owner_id?: string
          owner_response?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_safety_scores: {
        Row: {
          created_at: string
          has_cctv: boolean
          has_fire_safety: boolean
          has_security_guard: boolean
          hostel_id: string
          level: string
          nearby_hospital: boolean
          nearby_police: boolean
          ref_id: string | null
          score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          has_cctv?: boolean
          has_fire_safety?: boolean
          has_security_guard?: boolean
          hostel_id: string
          level?: string
          nearby_hospital?: boolean
          nearby_police?: boolean
          ref_id?: string | null
          score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          has_cctv?: boolean
          has_fire_safety?: boolean
          has_security_guard?: boolean
          hostel_id?: string
          level?: string
          nearby_hospital?: boolean
          nearby_police?: boolean
          ref_id?: string | null
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_safety_scores_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: true
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_upi: {
        Row: {
          created_at: string
          hostel_id: string
          owner_id: string
          updated_at: string
          upi_id: string
        }
        Insert: {
          created_at?: string
          hostel_id: string
          owner_id: string
          updated_at?: string
          upi_id: string
        }
        Update: {
          created_at?: string
          hostel_id?: string
          owner_id?: string
          updated_at?: string
          upi_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_upi_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: true
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          address: string | null
          area: string | null
          available_rooms: number
          bookings: number | null
          city: string
          created_at: string | null
          description: string | null
          distance_from_college: string | null
          facilities: string[] | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          nearby_college: string | null
          occupancy: string | null
          owner_id: string | null
          owner_name: string | null
          price: number
          rating: number | null
          ref_id: string | null
          revenue: number | null
          review_count: number | null
          rules: string[] | null
          total_rooms: number
          type: string
          views: number | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          available_rooms?: number
          bookings?: number | null
          city: string
          created_at?: string | null
          description?: string | null
          distance_from_college?: string | null
          facilities?: string[] | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          nearby_college?: string | null
          occupancy?: string | null
          owner_id?: string | null
          owner_name?: string | null
          price: number
          rating?: number | null
          ref_id?: string | null
          revenue?: number | null
          review_count?: number | null
          rules?: string[] | null
          total_rooms?: number
          type?: string
          views?: number | null
        }
        Update: {
          address?: string | null
          area?: string | null
          available_rooms?: number
          bookings?: number | null
          city?: string
          created_at?: string | null
          description?: string | null
          distance_from_college?: string | null
          facilities?: string[] | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          nearby_college?: string | null
          occupancy?: string | null
          owner_id?: string | null
          owner_name?: string | null
          price?: number
          rating?: number | null
          ref_id?: string | null
          revenue?: number | null
          review_count?: number | null
          rules?: string[] | null
          total_rooms?: number
          type?: string
          views?: number | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          hostel_id: string
          id: string
          message: string
          owner_id: string
          reply: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          student_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hostel_id: string
          id?: string
          message: string
          owner_id: string
          reply?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          student_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hostel_id?: string
          id?: string
          message?: string
          owner_id?: string
          reply?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          student_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          hostel_id: string
          owner_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          hostel_id: string
          owner_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          hostel_id?: string
          owner_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "chat_conversations_hostel_id_fkey"; columns: ["hostel_id"]; isOneToOne: false; referencedRelation: "hostels"; referencedColumns: ["id"] },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          hostel_id: string | null
          id: string
          image_path: string | null
          image_url: string | null
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          hostel_id?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          hostel_id?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_trust_scores: {
        Row: {
          avg_rating: number
          bookings_completed: number
          complaints_count: number
          created_at: string
          months_on_platform: number
          owner_id: string
          response_minutes: number
          score: number
          updated_at: string
          verified: boolean
        }
        Insert: {
          avg_rating?: number
          bookings_completed?: number
          complaints_count?: number
          created_at?: string
          months_on_platform?: number
          owner_id: string
          response_minutes?: number
          score?: number
          updated_at?: string
          verified?: boolean
        }
        Update: {
          avg_rating?: number
          bookings_completed?: number
          complaints_count?: number
          created_at?: string
          months_on_platform?: number
          owner_id?: string
          response_minutes?: number
          score?: number
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          avg_response_minutes: number
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_verified: boolean
          owner_rating: number
          owner_review_count: number
          phone: string | null
          ref_id: string | null
          response_rate: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          avg_response_minutes?: number
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean
          owner_rating?: number
          owner_review_count?: number
          phone?: string | null
          ref_id?: string | null
          response_rate?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          avg_response_minutes?: number
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean
          owner_rating?: number
          owner_review_count?: number
          phone?: string | null
          ref_id?: string | null
          response_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          action: string
          created_at: string
          hostel_id: string
          id: string
          student_id: string
        }
        Insert: {
          action: string
          created_at?: string
          hostel_id: string
          id?: string
          student_id: string
        }
        Update: {
          action?: string
          created_at?: string
          hostel_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_history: {
        Row: {
          booked: boolean
          created_at: string
          id: string
          preference_snapshot: Json
          recommended_hostels: Json
          selected_hostel_id: string | null
          student_id: string
        }
        Insert: {
          booked?: boolean
          created_at?: string
          id?: string
          preference_snapshot?: Json
          recommended_hostels?: Json
          selected_hostel_id?: string | null
          student_id: string
        }
        Update: {
          booked?: boolean
          created_at?: string
          id?: string
          preference_snapshot?: Json
          recommended_hostels?: Json
          selected_hostel_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_history_selected_hostel_id_fkey"
            columns: ["selected_hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_scores: {
        Row: {
          confidence: number
          generated_at: string
          hostel_id: string
          id: string
          overall: number
          student_id: string
          sub_scores: Json
          weights: Json
        }
        Insert: {
          confidence?: number
          generated_at?: string
          hostel_id: string
          id?: string
          overall: number
          student_id: string
          sub_scores?: Json
          weights?: Json
        }
        Update: {
          confidence?: number
          generated_at?: string
          hostel_id?: string
          id?: string
          overall?: number
          student_id?: string
          sub_scores?: Json
          weights?: Json
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_scores_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_agreements: {
        Row: {
          created_at: string
          end_date: string
          hostel_id: string
          id: string
          monthly_rent: number
          owner_id: string
          owner_signature: string | null
          owner_signed_at: string | null
          security_deposit: number
          start_date: string
          status: Database["public"]["Enums"]["agreement_status"]
          student_email: string | null
          student_id: string
          student_name: string
          student_phone: string | null
          student_signature: string | null
          student_signed_at: string | null
          student_signed_ip: string | null
          terms: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          hostel_id: string
          id?: string
          monthly_rent: number
          owner_id: string
          owner_signature?: string | null
          owner_signed_at?: string | null
          security_deposit?: number
          start_date: string
          status?: Database["public"]["Enums"]["agreement_status"]
          student_email?: string | null
          student_id: string
          student_name: string
          student_phone?: string | null
          student_signature?: string | null
          student_signed_at?: string | null
          student_signed_ip?: string | null
          terms: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          hostel_id?: string
          id?: string
          monthly_rent?: number
          owner_id?: string
          owner_signature?: string | null
          owner_signed_at?: string | null
          security_deposit?: number
          start_date?: string
          status?: Database["public"]["Enums"]["agreement_status"]
          student_email?: string | null
          student_id?: string
          student_name?: string
          student_phone?: string | null
          student_signature?: string | null
          student_signed_at?: string | null
          student_signed_ip?: string | null
          terms?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_agreements_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string
          created_at: string
          hostel_id: string
          id: string
          is_anonymous: boolean
          is_reported: boolean
          owner_id: string
          owner_replied_at: string | null
          owner_reply: string | null
          rating: number
          ref_id: string | null
          report_reason: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          comment?: string
          created_at?: string
          hostel_id: string
          id?: string
          is_anonymous?: boolean
          is_reported?: boolean
          owner_id: string
          owner_replied_at?: string | null
          owner_reply?: string | null
          rating: number
          ref_id?: string | null
          report_reason?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          comment?: string
          created_at?: string
          hostel_id?: string
          id?: string
          is_anonymous?: boolean
          is_reported?: boolean
          owner_id?: string
          owner_replied_at?: string | null
          owner_reply?: string | null
          rating?: number
          ref_id?: string | null
          report_reason?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      student_preferences: {
        Row: {
          budget_max: number
          budget_min: number
          created_at: string
          food_preference: string
          gender_preference: string
          id: string
          importance_budget: number
          importance_distance: number
          importance_facility: number
          importance_safety: number
          laundry_required: boolean
          parking_required: boolean
          preferred_distance_km: number
          preferred_lat: number | null
          preferred_lng: number | null
          preferred_location: string | null
          preferred_radius_km: number
          room_type: string
          sharing_preference: string
          student_id: string
          study_environment: string
          updated_at: string
          wifi_required: boolean
        }
        Insert: {
          budget_max?: number
          budget_min?: number
          created_at?: string
          food_preference?: string
          gender_preference?: string
          id?: string
          importance_budget?: number
          importance_distance?: number
          importance_facility?: number
          importance_safety?: number
          laundry_required?: boolean
          parking_required?: boolean
          preferred_distance_km?: number
          preferred_lat?: number | null
          preferred_lng?: number | null
          preferred_location?: string | null
          preferred_radius_km?: number
          room_type?: string
          sharing_preference?: string
          student_id: string
          study_environment?: string
          updated_at?: string
          wifi_required?: boolean
        }
        Update: {
          budget_max?: number
          budget_min?: number
          created_at?: string
          food_preference?: string
          gender_preference?: string
          id?: string
          importance_budget?: number
          importance_distance?: number
          importance_facility?: number
          importance_safety?: number
          laundry_required?: boolean
          parking_required?: boolean
          preferred_distance_km?: number
          preferred_lat?: number | null
          preferred_lng?: number | null
          preferred_location?: string | null
          preferred_radius_km?: number
          room_type?: string
          sharing_preference?: string
          student_id?: string
          study_environment?: string
          updated_at?: string
          wifi_required?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          address_proof_url: string
          admin_notes: string | null
          business_doc_url: string | null
          created_at: string
          id: string
          id_proof_url: string
          owner_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_url: string
          status: string
          updated_at: string
        }
        Insert: {
          address_proof_url: string
          admin_notes?: string | null
          business_doc_url?: string | null
          created_at?: string
          id?: string
          id_proof_url: string
          owner_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          address_proof_url?: string
          admin_notes?: string | null
          business_doc_url?: string | null
          created_at?: string
          id?: string
          id_proof_url?: string
          owner_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      make_ref_id: { Args: { _prefix: string; _seq: string }; Returns: string }
      recalc_owner_trust: { Args: { _owner_id: string }; Returns: undefined }
    }
    Enums: {
      agreement_status: "draft" | "sent" | "signed" | "cancelled"
      app_role: "student" | "owner" | "admin"
      booking_status: "pending" | "confirmed" | "rejected" | "cancelled"
      complaint_category:
        | "maintenance"
        | "cleanliness"
        | "safety"
        | "billing"
        | "other"
      complaint_status: "open" | "in_progress" | "resolved" | "closed"
      inquiry_status: "pending" | "replied" | "closed"
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
      agreement_status: ["draft", "sent", "signed", "cancelled"],
      app_role: ["student", "owner", "admin"],
      booking_status: ["pending", "confirmed", "rejected", "cancelled"],
      complaint_category: [
        "maintenance",
        "cleanliness",
        "safety",
        "billing",
        "other",
      ],
      complaint_status: ["open", "in_progress", "resolved", "closed"],
      inquiry_status: ["pending", "replied", "closed"],
    },
  },
} as const
