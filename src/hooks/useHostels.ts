import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface DbHostel {
  id: string;
  owner_id: string | null;
  name: string;
  location: string;
  city: string;
  price: number;
  rating: number;
  review_count: number;
  distance_from_college: string;
  images: string[];
  facilities: string[];
  type: "boys" | "girls" | "co-ed";
  occupancy: string;
  description: string;
  owner_name: string;
  rules: string[];
  is_featured: boolean;
  views: number;
  bookings: number;
  revenue: number;
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  available_rooms?: number | null;
  total_rooms?: number | null;
}

async function fetchHostels(): Promise<DbHostel[]> {
  const { data, error } = await supabase
    .from("hostels")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as DbHostel[];
}

export function useHostels() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["hostels"],
    queryFn: fetchHostels,
  });

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel(`hostels-realtime-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hostels" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["hostels"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useHostelById(id: string | undefined) {
  return useQuery({
    queryKey: ["hostel", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("hostels")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as DbHostel;
    },
    enabled: !!id,
  });
}

export function useOwnerHostels(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["hostels", "owner", ownerId],
    queryFn: async () => {
      if (!ownerId) return [];
      const { data, error } = await supabase
        .from("hostels")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DbHostel[];
    },
    enabled: !!ownerId,
  });

  // Realtime for owner listings
  useEffect(() => {
    if (!ownerId) return;
    const channel = supabase
      .channel(`owner-hostels-realtime-${ownerId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hostels", filter: `owner_id=eq.${ownerId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["hostels", "owner", ownerId] });
          queryClient.invalidateQueries({ queryKey: ["hostels"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId, queryClient]);

  return query;
}
