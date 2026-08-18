import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export type AssistantMsg = { id?: string; role: "user" | "assistant"; content: string };

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hostel-assistant`;

/**
 * Streaming chat state for the HostelHub AI assistant. Same backend edge
 * function and history table used by the desktop widget.
 */
export function useAssistantChat() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<AssistantMsg[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setMessages([]);
      return;
    }
    setLoadingHistory(true);
    (async () => {
      const { data } = await supabase
        .from("assistant_messages")
        .select("id, role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(
          data
            .filter((m: any) => m.role === "user" || m.role === "assistant")
            .map((m: any) => ({ id: m.id, role: m.role, content: m.content })),
        );
      }
      setLoadingHistory(false);
    })();
  }, [user?.id]);

  const persist = useCallback(
    async (role: "user" | "assistant", content: string) => {
      if (!user?.id) return;
      await supabase.from("assistant_messages").insert({ user_id: user.id, role, content });
    },
    [user?.id],
  );

  const clearHistory = useCallback(async () => {
    if (user?.id) await supabase.from("assistant_messages").delete().eq("user_id", user.id);
    setMessages([]);
  }, [user?.id]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || sending) return;
      setSending(true);

      const next: AssistantMsg[] = [...messages, { role: "user", content }];
      setMessages([...next, { role: "assistant", content: "" }]);
      persist("user", content);

      const fail = async (msg: string) => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: msg };
          return copy;
        });
        await persist("assistant", msg);
      };

      try {
        const res = await fetch(FUNCTIONS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: next }),
        });

        if (!res.ok || !res.body) {
          let msg = "Sorry, something went wrong. Please try again.";
          if (res.status === 429) msg = "I'm getting a lot of questions right now. Try again in a moment.";
          if (res.status === 402) msg = "AI credits are exhausted. Please add credits in workspace billing.";
          await fail(msg);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta =
                json.candidates?.[0]?.content?.parts?.[0]?.text ??
                json.choices?.[0]?.delta?.content;
              if (delta) {
                full += delta;
                setMessages((m) => {
                  const copy = [...m];
                  copy[copy.length - 1] = { role: "assistant", content: full };
                  return copy;
                });
              }
            } catch {
              /* partial chunk */
            }
          }
        }

        if (full) await persist("assistant", full);
        else await fail("I couldn't answer that. Please try again.");
      } catch (e) {
        await fail("Network error. Please check your connection and try again.");
      } finally {
        setSending(false);
      }
    },
    [messages, persist, sending],
  );

  return { messages, sending, loadingHistory, send, clearHistory };
}
