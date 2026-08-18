import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { AppHeader, HeaderIconButton } from "@/components/mobile/AppHeader";
import { AppScreen } from "@/components/mobile/AppScreen";
import { Chip } from "@/components/mobile/MobileKit";
import { useAssistantChat } from "@/hooks/useAssistantChat";
import { cn } from "@/lib/utils";

const QUICK_REPLIES = [
  "Find hostels under ₹5000/month",
  "How do I book a room?",
  "Show girls' hostels",
  "What is the minimum stay period?",
];

export function AssistantScreen() {
  const { messages, sending, loadingHistory, send, clearHistory } = useAssistantChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    send(text);
  };

  return (
    <AppScreen withTabBar={false} className="flex flex-col">
      <AppHeader
        title="AI Assistant"
        subtitle="Ask anything about hostels"
        back
        actions={
          <HeaderIconButton label="Clear chat" onClick={clearHistory}>
            <Trash2 className="h-[20px] w-[20px]" />
          </HeaderIconButton>
        }
      />

      <div className="app-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-40">
        {loadingHistory && (
          <div className="grid place-items-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="pt-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-coral-light text-primary">
              <Sparkles className="h-8 w-8" />
            </span>
            <p className="mt-4 text-[17px] font-bold tracking-tight text-foreground">
              How can I help?
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Ask about budgets, areas, booking steps or house rules.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {QUICK_REPLIES.map((q) => (
                <Chip key={q} onClick={() => send(q)}>
                  {q}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={m.id ?? i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-3xl px-4 py-3 text-[14px] leading-relaxed",
                m.role === "user"
                  ? "rounded-br-lg bg-primary text-primary-foreground"
                  : "rounded-bl-lg bg-app-surface text-foreground shadow-app-card",
              )}
            >
              {m.role === "assistant" && !m.content ? (
                <span className="flex gap-1 py-1">
                  <Dot /> <Dot /> <Dot />
                </span>
              ) : m.role === "assistant" ? (
                <div className="prose-sm [&_a]:text-primary [&_li]:my-0.5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="glass-bar fixed inset-x-0 bottom-0 z-50 border-t border-app-hairline px-4 pb-[max(0.75rem,var(--safe-bottom))] pt-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message HostelHub AI…"
            className="app-scroll max-h-32 min-h-[3rem] flex-1 resize-none rounded-3xl bg-muted px-4 py-3.5 text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            aria-label="Send message"
            onClick={submit}
            disabled={sending || !input.trim()}
            className="tap grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </AppScreen>
  );
}

function Dot() {
  return <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60" />;
}
