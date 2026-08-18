import { supabase } from "@/integrations/supabase/client";
import type { StudentPreference } from "../types";
import { DEFAULT_PREFERENCE } from "../types";

export const preferencesRepo = {
  async get(studentId: string): Promise<StudentPreference | null> {
    const { data, error } = await supabase
      .from("student_preferences")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as StudentPreference) ?? null;
  },

  async upsert(pref: StudentPreference): Promise<StudentPreference> {
    const { data, error } = await supabase
      .from("student_preferences")
      .upsert(pref as any, { onConflict: "student_id" })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as StudentPreference;
  },

  buildDefault(studentId: string): StudentPreference {
    return { student_id: studentId, ...DEFAULT_PREFERENCE };
  },
};