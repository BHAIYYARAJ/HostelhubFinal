import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "@/lib/router-compat";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatConversation } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";

export default function DedicatedChatView({ conversationId, mobile = false }: { conversationId: string; mobile?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { conversation, messages, loading, sendMessage } = useChatConversation(conversationId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  if (!user) return null;
  const other = user.id === conversation?.student_id ? conversation?.owner : conversation?.student;
  const otherName = other?.full_name || (user.id === conversation?.student_id ? "Hostel owner" : "Student");

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try { await sendMessage(input); setInput(""); } catch (e: any) { toast.error(e?.message || "Failed to send message"); }
    finally { setSending(false); }
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) { toast.error("Choose an image under 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("chat-images").upload(path, file, { cacheControl: "3600", contentType: file.type });
      if (error) throw error;
      const { data } = await supabase.storage.from("chat-images").createSignedUrl(path, 60 * 60 * 24 * 365);
      if (!data?.signedUrl) throw new Error("Could not create image URL");
      await sendMessage("", data.signedUrl, path);
    } catch (e: any) { toast.error(e?.message || "Failed to upload image"); }
    finally { setUploading(false); }
  };

  return (
    <div className={mobile ? "flex min-h-[calc(100dvh-4.25rem)] flex-col bg-app-canvas" : "flex h-[calc(100vh-8rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"}>
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
        {mobile && <button type="button" aria-label="Back to chats" onClick={() => navigate(user.role === "owner" ? "/owner/chats" : "/chats")} className="grid h-9 w-9 place-items-center rounded-full bg-secondary"><ArrowLeft className="h-4 w-4" /></button>}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{otherName}</p>
          <p className="truncate text-xs text-muted-foreground">{conversation?.hostel?.name || "Hostel"}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain p-4" style={{ touchAction: "pan-y" }}>
        {loading ? <div className="grid h-full place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center"><div><MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" /><p className="text-sm font-semibold">Start the conversation</p><p className="mt-1 text-xs text-muted-foreground">Chat about {conversation?.hostel?.name || "this hostel"}.</p></div></div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const mine = msg.sender_id === user.id;
              return <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary text-foreground"}`}>
                  {msg.image_url && <a href={msg.image_url} target="_blank" rel="noreferrer"><img src={msg.image_url} alt="Shared" className="mb-2 max-h-60 rounded-lg object-cover" /></a>}
                  {msg.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>}
                  <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{format(new Date(msg.created_at), "h:mm a")}{mine && (msg.is_read ? " · Read" : " · Sent")}</p>
                </div>
              </div>;
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-card p-3 pb-[max(12px,var(--safe-bottom))]">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        <div className="flex items-end gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground"><ImagePlus className="h-4 w-4" /></button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} rows={1} placeholder="Type a message..." className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          <button type="button" onClick={handleSend} disabled={!input.trim() || sending} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
        </div>
      </div>
    </div>
  );
}
