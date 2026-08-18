import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export interface Booking {
  id: string;
  hostel_id: string;
  student_id: string;
  owner_id: string;
  student_name: string;
  student_email: string | null;
  student_phone: string | null;
  room_type: string;
  move_in_date: string;
  monthly_rent: number;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  hostel?: { name: string; city: string; location: string; images: string[] } | null;
}

function useRealtimeBookings(filter: { column: "student_id" | "owner_id"; value: string } | null) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!filter) return;
    const channel = supabase
      .channel(`bookings-${filter.column}-${filter.value}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          qc.invalidateQueries({ queryKey: ["bookings"] });
          qc.invalidateQueries({ queryKey: ["hostels"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter?.column, filter?.value, qc]);
}

export function useStudentBookings() {
  const user = useAuthStore((s) => s.user);
  useRealtimeBookings(user ? { column: "student_id", value: user.id } : null);
  return useQuery({
    queryKey: ["bookings", "student", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, hostel:hostels(name, city, location, images)")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Booking[];
    },
  });
}

export function useOwnerBookings() {
  const user = useAuthStore((s) => s.user);
  useRealtimeBookings(user ? { column: "owner_id", value: user.id } : null);
  return useQuery({
    queryKey: ["bookings", "owner", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, hostel:hostels(name, city, location, images)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Booking[];
    },
  });
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
}