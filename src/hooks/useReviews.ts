import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export interface DbReview {
  id: string;
  hostel_id: string;
  booking_id: string;
  student_id: string;
  owner_id: string;
  rating: number;
  comment: string;
  is_anonymous: boolean;
  owner_reply: string | null;
  owner_replied_at: string | null;
  is_reported: boolean;
  report_reason: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
}

async function fetchReviews(hostelId: string): Promise<DbReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("hostel_id", hostelId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const reviews = (data ?? []) as unknown as DbReview[];
  const ids = [...new Set(reviews.filter((r) => !r.is_anonymous).map((r) => r.student_id))];
  if (ids.length === 0) return reviews;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ids);
  const names = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name]));
  return reviews.map((r) => ({
    ...r,
    student_name: r.is_anonymous ? null : names.get(r.student_id) ?? null,
  }));
}

export function useReviews(hostelId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["reviews", hostelId],
    queryFn: () => fetchReviews(hostelId!),
    enabled: !!hostelId,
  });

  useEffect(() => {
    if (!hostelId) return;
    const channel = supabase
      .channel(`reviews-${hostelId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews", filter: `hostel_id=eq.${hostelId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["reviews", hostelId] });
          qc.invalidateQueries({ queryKey: ["hostel", hostelId] });
          qc.invalidateQueries({ queryKey: ["hostels"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [hostelId, qc]);

  return query;
}

/**
 * A student may review a hostel only after a confirmed booking whose move-in
 * date has passed, and only once per booking.
 */
export function useReviewEligibility(hostelId: string | undefined) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["reviews", "eligibility", hostelId, user?.id],
    enabled: !!hostelId && !!user,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("id, owner_id, move_in_date")
        .eq("hostel_id", hostelId!)
        .eq("student_id", user!.id)
        .eq("status", "confirmed")
        .lte("move_in_date", today)
        .order("move_in_date", { ascending: false });
      if (error) throw error;
      if (!bookings?.length) return { eligible: false as const, bookingId: null, ownerId: null };

      const { data: existing } = await supabase
        .from("reviews")
        .select("booking_id")
        .eq("student_id", user!.id)
        .in("booking_id", bookings.map((b) => b.id));
      const used = new Set((existing ?? []).map((r: any) => r.booking_id));
      const open = bookings.find((b) => !used.has(b.id));
      if (!open) return { eligible: false as const, bookingId: null, ownerId: null };
      return { eligible: true as const, bookingId: open.id, ownerId: open.owner_id as string };
    },
  });
}

export function useReviewMutations(hostelId: string | undefined) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reviews", hostelId] });
    qc.invalidateQueries({ queryKey: ["reviews", "eligibility", hostelId, user?.id] });
    qc.invalidateQueries({ queryKey: ["hostel", hostelId] });
  };

  const create = useMutation({
    mutationFn: async (input: {
      bookingId: string;
      ownerId: string;
      rating: number;
      comment: string;
      isAnonymous: boolean;
    }) => {
      if (!user || !hostelId) throw new Error("Not signed in");
      const { error } = await supabase.from("reviews").insert({
        hostel_id: hostelId,
        booking_id: input.bookingId,
        student_id: user.id,
        owner_id: input.ownerId,
        rating: input.rating,
        comment: input.comment,
        is_anonymous: input.isAnonymous,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reply = useMutation({
    mutationFn: async (input: { reviewId: string; reply: string }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ owner_reply: input.reply, owner_replied_at: new Date().toISOString() })
        .eq("id", input.reviewId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const report = useMutation({
    mutationFn: async (input: { reviewId: string; reason: string }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ is_reported: true, report_reason: input.reason })
        .eq("id", input.reviewId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, reply, report };
}
