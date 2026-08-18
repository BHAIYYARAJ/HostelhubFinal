import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import type { Database } from "@/integrations/supabase/types";

export type Agreement = Database["public"]["Tables"]["rental_agreements"]["Row"] & {
  hostel?: { name: string; location: string; city: string } | null;
};

export function useStudentAgreements() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`agreements-student-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_agreements", filter: `student_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["agreements", "student", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  return useQuery({
    enabled: !!user,
    queryKey: ["agreements", "student", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_agreements")
        .select("*, hostel:hostels(name, location, city)")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Agreement[];
    },
  });
}

export function useOwnerAgreements() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`agreements-owner-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_agreements", filter: `owner_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["agreements", "owner", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  return useQuery({
    enabled: !!user,
    queryKey: ["agreements", "owner", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_agreements")
        .select("*, hostel:hostels(name, location, city)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Agreement[];
    },
  });
}