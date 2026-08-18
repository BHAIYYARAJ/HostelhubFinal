import { Navigate } from "@/lib/router-compat";
import { FileQuestion, Clock3, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStudentInquiries } from "@/hooks/useStudentInquiries";
import { useAuthStore } from "@/store/useAuthStore";

const meta = {
  pending: { label: "Pending", icon: Clock3 },
  replied: { label: "Replied", icon: CheckCircle2 },
  closed: { label: "Closed", icon: XCircle },
} as const;

export default function StudentInquiries() {
  const user = useAuthStore((s) => s.user);
  const { data = [], isLoading } = useStudentInquiries();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><FileQuestion /></div>
          <div><h1 className="text-2xl font-bold">My Inquiries</h1><p className="text-sm text-muted-foreground">Formal inquiries you sent to hostel owners</p></div>
        </div>
        {isLoading ? <div className="py-16 text-center text-sm text-muted-foreground">Loading inquiries...</div> : data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center"><FileQuestion className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">No inquiries yet</h2><p className="mt-1 text-sm text-muted-foreground">Send a formal inquiry from a hostel listing.</p></div>
        ) : (
          <div className="space-y-4">
            {data.map((inquiry) => { const m = meta[inquiry.status]; const Icon = m.icon; return (
              <article key={inquiry.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{inquiry.subject}</h2><p className="mt-1 text-sm text-muted-foreground">{inquiry.hostel?.name ?? "Hostel"}{inquiry.hostel?.city ? ` · ${inquiry.hostel.city}` : ""}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold"><Icon className="h-3.5 w-3.5" />{m.label}</span></div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{inquiry.message}</p>
                {inquiry.reply && <div className="mt-4 rounded-xl bg-primary/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-primary">Owner reply</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{inquiry.reply}</p></div>}
                <p className="mt-4 text-xs text-muted-foreground">{format(new Date(inquiry.updated_at || inquiry.created_at), "dd MMM yyyy, h:mm a")}</p>
              </article>
            ); })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
