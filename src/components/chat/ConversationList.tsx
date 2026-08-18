import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/lib/router-compat";
import type { ChatConversation } from "@/hooks/useConversations";

export default function ConversationList({ conversations, role }: { conversations: ChatConversation[]; role: "student" | "owner" }) {
  if (!conversations.length) return <div className="rounded-2xl border border-dashed border-border p-10 text-center"><MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-semibold">No chats yet</p><p className="mt-1 text-sm text-muted-foreground">{role === "student" ? "Open a hostel and choose Chat with Owner." : "Students who start conversations will appear here."}</p></div>;
  return <div className="space-y-2">{conversations.map((c) => {
    const other = role === "student" ? c.owner : c.student;
    const name = other?.full_name || (role === "student" ? "Hostel owner" : "Student");
    const message = c.last_message?.content || (c.last_message?.image_url ? "Photo" : "Start a conversation");
    return <Link key={c.id} to={role === "student" ? `/chats/${c.id}` : `/owner/chats/${c.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary">
      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-primary font-bold">{other?.avatar_url ? <img src={other.avatar_url} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}</div>
      <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate font-semibold text-foreground">{name}</p><span className="shrink-0 text-[11px] text-muted-foreground">{c.last_message?.created_at ? formatDistanceToNow(new Date(c.last_message.created_at), { addSuffix: true }) : ""}</span></div><p className="truncate text-xs font-medium text-primary">{c.hostel?.name || "Hostel"}</p><p className="truncate text-sm text-muted-foreground">{message}</p></div>
      {c.unread_count ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{c.unread_count}</span> : null}
    </Link>;
  })}</div>;
}
