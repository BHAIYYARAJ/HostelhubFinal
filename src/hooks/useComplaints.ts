import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import type { Database } from "@/integrations/supabase/types";

export type Complaint = Database["public"]["Tables"]["complaints"]["Row"] & {
  hostel?: { name: string; location: string; city: string } | null;
};

export function useStudentComplaints() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`complaints-student-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `student_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["complaints", "student", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  return useQuery({
    enabled: !!user,
    queryKey: ["complaints", "student", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*, hostel:hostels(name, location, city)")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });
}

export function useOwnerComplaints() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`complaints-owner-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints", filter: `owner_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["complaints", "owner", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  return useQuery({
    enabled: !!user,
    queryKey: ["complaints", "owner", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*, hostel:hostels(name, location, city)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });
}