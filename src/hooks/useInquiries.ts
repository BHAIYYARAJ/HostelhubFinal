import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export type InquiryStatus = "pending" | "replied" | "closed";

export interface Inquiry {
  id: string;
  hostel_id: string;
  student_id: string;
  owner_id: string;
  subject: string;
  message: string;
  reply: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  hostel?: { name: string; city: string; images: string[] } | null;
  student?: { full_name: string | null; avatar_url: string | null; email: string | null } | null;
}

export function useOwnerInquiries(ownerId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["inquiries", "owner", ownerId],
    queryFn: async (): Promise<Inquiry[]> => {
      if (!ownerId) return [];
      const { data, error } = await supabase
        .from("inquiries")
        .select("*, hostel:hostels(name, city, images)")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const inquiries = (data ?? []) as unknown as Inquiry[];
      const studentIds = Array.from(new Set(inquiries.map((i) => i.student_id)));
      if (studentIds.length === 0) return inquiries;
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("id", studentIds);
      const map = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      return inquiries.map((i) => ({
        ...i,
        student: map.get(i.student_id) ?? null,
      }));
    },
    enabled: !!ownerId,
  });

  useEffect(() => {
    if (!ownerId) return;
    const ch = supabase
      .channel(`inquiries-owner-${ownerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inquiries", filter: `owner_id=eq.${ownerId}` },
        () => qc.invalidateQueries({ queryKey: ["inquiries", "owner", ownerId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [ownerId, qc]);

  return query;
}

export function useUnreadInquiryCount() {
  const user = useAuthStore((s) => s.user);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const load = async () => {
      const { count: c } = await supabase
        .from("inquiries")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("status", "pending");
      if (active) setCount(c || 0);
    };
    load();
    const ch = supabase
      .channel(`inquiries-unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inquiries", filter: `owner_id=eq.${user.id}` },
        load,
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [user?.id]);

  return count;
}

export function useCreateInquiry() {
  const user = useAuthStore((s) => s.user);

  return useCallback(
    async (input: { hostelId: string; ownerId: string; subject: string; message: string }) => {
      if (!user?.id) throw new Error("Not signed in");
      const { error } = await supabase.from("inquiries").insert({
        hostel_id: input.hostelId,
        owner_id: input.ownerId,
        student_id: user.id,
        subject: input.subject,
        message: input.message,
      });
      if (error) throw error;
    },
    [user?.id],
  );
}

export async function replyInquiry(id: string, reply: string) {
  const { error } = await supabase
    .from("inquiries")
    .update({ reply, status: "replied" })
    .eq("id", id);
  if (error) throw error;
}

export async function setInquiryStatus(id: string, status: InquiryStatus) {
  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}