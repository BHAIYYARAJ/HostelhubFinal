import { supabase } from "@/integrations/supabase/client";
import type { OwnerTrustScore } from "../types";

export const trustRepo = {
  async listAll(): Promise<OwnerTrustScore[]> {
    const { data, error } = await supabase
      .from("owner_trust_scores")
      .select("*");
    if (error) throw error;
    return (data ?? []) as unknown as OwnerTrustScore[];
  },

  async get(ownerId: string): Promise<OwnerTrustScore | null> {
    const { data, error } = await supabase
      .from("owner_trust_scores")
      .select("*")
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as OwnerTrustScore) ?? null;
  },
};