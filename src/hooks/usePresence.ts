import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Tracks the current user's presence and returns whether `targetUserId` is online.
 * Each hook instance uses its own channel to avoid "callbacks after subscribe()" errors
 * that occur when multiple components share a single named realtime channel.
 */
export function usePresence(targetUserId?: string) {
  const user = useAuthStore((s) => s.user);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const channelName = `presence-${user.id}-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel(channelName, {
      config: { presence: { key: user.id } },
    });

    const compute = () => {
      if (!targetUserId) return;
      const state = channel.presenceState() as Record<string, unknown[]>;
      setOnline(!!state[targetUserId]?.length);
    };

    channel
      .on("presence", { event: "sync" }, compute)
      .on("presence", { event: "join" }, compute)
      .on("presence", { event: "leave" }, compute)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
          compute();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, targetUserId]);

  return online;
}