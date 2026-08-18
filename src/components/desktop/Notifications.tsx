import { Bell, CalendarCheck, FileQuestion, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Navigate, Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStudentNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/useAuthStore";

const icons = { booking: CalendarCheck, inquiry: FileQuestion, chat: MessageCircle };
export default function Notifications() {
  const user = useAuthStore((s) => s.user);
  const { data = [], isLoading } = useStudentNotifications();
  if (!user) return <Navigate to="/login" replace />;
  return <div className="min-h-screen bg-background"><Navbar /><main className="container py-10"><div className="mb-8 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Bell /></div><div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-muted-foreground">Your booking, inquiry and chat updates</p></div></div>{isLoading ? <div className="py-16 text-center text-sm text-muted-foreground">Loading notifications...</div> : data.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-16 text-center"><Bell className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">You're all caught up</h2><p className="mt-1 text-sm text-muted-foreground">New activity will appear here.</p></div> : <div className="mx-auto max-w-3xl space-y-3">{data.map((n) => { const Icon = icons[n.kind]; return <Link key={n.id} to={n.href} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-secondary/30"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold">{n.title}</span><span className="mt-1 block text-sm text-muted-foreground">{n.body}</span><span className="mt-1 block text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.time), { addSuffix: true })}</span></span>{n.unread && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />}</Link>; })}</div>}</main><Footer /></div>;
}
