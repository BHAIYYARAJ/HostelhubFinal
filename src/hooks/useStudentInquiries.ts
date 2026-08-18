import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import type { Inquiry } from "@/hooks/useInquiries";

export function useStudentInquiries() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const key = ["inquiries", "student", user?.id];

  const query = useQuery({
    queryKey: key,
    enabled: !!user?.id && user.role === "student",
    queryFn: async (): Promise<Inquiry[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("inquiries")
        .select("*, hostel:hostels(name, city, images)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const inquiries = (data ?? []) as unknown as Inquiry[];
      const ownerIds = Array.from(new Set(inquiries.map((i) => i.owner_id)));
      if (!ownerIds.length) return inquiries;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("id", ownerIds);
      const map = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      return inquiries.map((i) => ({ ...i, student: map.get(i.owner_id) ?? null }));
    },
  });

  useEffect(() => {
    if (!user?.id || user.role !== "student") return;
    const channel = supabase
      .channel(`inquiries-student-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiries", filter: `student_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: key });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, user?.role, queryClient]);

  return query;
}
