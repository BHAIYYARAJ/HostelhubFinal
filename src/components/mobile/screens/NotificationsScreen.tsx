import { Bell, CalendarCheck, FileQuestion, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { EmptyState } from "@/components/mobile/MobileKit";
import { useStudentNotifications } from "@/hooks/useNotifications";
import { Link } from "@/lib/router-compat";

const icons = { booking: CalendarCheck, inquiry: FileQuestion, chat: MessageCircle };

export function NotificationsScreen() {
  const { data = [], isLoading } = useStudentNotifications();
  return <AppScreen><AppHeader title="Notifications" subtitle="Updates from your HostelHub activity" back /><ScreenSection className="pb-8">
    {isLoading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading notifications...</p> : data.length === 0 ? <EmptyState icon={Bell} title="You're all caught up" body="New booking, inquiry and chat updates will appear here." /> : <div className="space-y-2">{data.map((n) => { const Icon = icons[n.kind]; return <Link key={n.id} to={n.href} className="flex items-start gap-3 rounded-2xl bg-app-surface p-4 shadow-app-card"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-[14px] font-bold text-foreground">{n.title}</span><span className="mt-0.5 block line-clamp-2 text-[12px] text-muted-foreground">{n.body}</span><span className="mt-1 block text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(n.time), { addSuffix: true })}</span></span>{n.unread && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}</Link>; })}</div>}
  </ScreenSection></AppScreen>;
}
