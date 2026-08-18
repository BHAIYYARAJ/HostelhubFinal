import { supabase } from "@/integrations/supabase/client";

export type FeedbackAction =
  | "viewed"
  | "saved"
  | "compared"
  | "booked"
  | "dismissed"
  | "clicked";

export const feedbackRepo = {
  async record(studentId: string, hostelId: string, action: FeedbackAction) {
    try {
      await supabase
        .from("recommendation_feedback")
        .insert({ student_id: studentId, hostel_id: hostelId, action });
    } catch {
      /* ignore */
    }
  },

  async listAll() {
    const { data, error } = await supabase
      .from("recommendation_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw error;
    return data ?? [];
  },
};