import { useState } from "react";
import { Link, Navigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import {
  Plus, ArrowLeft, Building2, Eye, CalendarCheck, Phone, Mail,
  Pencil, Trash2, Search, Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOwnerHostels, DbHostel } from "@/hooks/useHostels";
import { supabase } from "@/integrations/supabase/client";
import AnalyticsCards from "@/components/owner/AnalyticsCards";
import RevenueChart from "@/components/owner/RevenueChart";
import BookingManager from "@/components/owner/BookingManager";
import ListingForm from "@/components/owner/ListingForm";
import InquiryManager from "@/components/owner/InquiryManager";
import VerificationPanel from "@/components/owner/VerificationPanel";
import ComplaintManager from "@/components/owner/ComplaintManager";
import AgreementManager from "@/components/owner/AgreementManager";
import OwnerChats from "@/components/desktop/OwnerChats";
import DedicatedChatView from "@/components/chat/DedicatedChatView";
import { useUnreadInquiryCount } from "@/hooks/useInquiries";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ease = [0.16, 1, 0.3, 1] as const;

const OwnerDashboard = ({ initialTab = "hostels", conversationId }: { initialTab?: "hostels" | "analytics" | "bookings" | "chats" | "inquiries" | "complaints" | "agreements" | "verification"; conversationId?: string }) => {
  const user = useAuthStore((s) => s.user);
  const { data: listings = [], isLoading } = useOwnerHostels(user?.id);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<DbHostel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [listingSearch, setListingSearch] = useState("");
  const [activeTab, setActiveTab] = useState<typeof initialTab>(initialTab);
  const pendingInquiries = useUnreadInquiryCount();

  if (!user || user.role !== "owner") {
    return <Navigate to="/login" replace />;
  }

  const openNew = () => { setEditData(null); setFormOpen(true); };
  const openEdit = (listing: DbHostel) => { setEditData(listing); setFormOpen(true); };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("hostels").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) {
      toast.error("Failed to delete listing");
    } else {
      toast.success("Listing deleted");
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    }
    setDeleteId(null);
  };

  const filteredListings = listings.filter((l) => {
    const q = listingSearch.toLowerCase();
    return !q || l.name.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.city.toLowerCase().includes(q);
  });

  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const totalBookings = listings.reduce((s, l) => s + (l.bookings || 0), 0);

  const tabs = [
    { key: "hostels" as const, label: "My Hostels", count: listings.length },
    { key: "analytics" as const, label: "Analytics" },
    { key: "bookings" as const, label: "Bookings" },
    { key: "chats" as const, label: "Chats" },
    { key: "inquiries" as const, label: "Inquiries", count: pendingInquiries },
    { key: "complaints" as const, label: "Complaints" },
    { key: "agreements" as const, label: "Agreements" },
    { key: "verification" as const, label: "Verification" },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Add Hostel
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-primary/20">
                <span className="text-2xl font-bold uppercase">{user.name.slice(0, 2)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </p>
                <Badge variant="secondary" className="mt-2 capitalize">{user.role}</Badge>
              </div>
            </div>
            <div className="flex gap-6 md:gap-10">
              {[
                { icon: Building2, label: "Listings", value: listings.length },
                { icon: Eye, label: "Total Views", value: totalViews.toLocaleString() },
                { icon: CalendarCheck, label: "Bookings", value: totalBookings },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                  <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="w-full overflow-x-auto rounded-xl bg-secondary p-1">
          <div className="flex min-w-max gap-1 md:min-w-0 md:w-full">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all md:flex-1 md:px-2 ${
                activeTab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {t.count}
                </span>
              )}
            </button>
          ))}
          </div>
        </div>

        {activeTab === "hostels" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm sm:w-80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search your listings..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <Button onClick={openNew} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Add New Hostel
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Loading your listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 rounded-full bg-secondary p-5">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No listings yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add your first hostel to get started</p>
                <Button onClick={openNew} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Add Hostel
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease }}
                    className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img src={l.images[0]} alt={l.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <Badge className="absolute left-3 top-3 capitalize">{l.type}</Badge>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-foreground line-clamp-1">{l.name}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{l.location}, {l.city}</p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-bold tabular-nums text-foreground">₹{l.price.toLocaleString()}<span className="font-normal text-muted-foreground">/mo</span></span>
                        <span className="text-xs text-muted-foreground">{l.views || 0} views · {l.bookings || 0} bookings</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => openEdit(l)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(l.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="space-y-8">
            <AnalyticsCards />
            <RevenueChart />
          </motion.div>
        )}

        {activeTab === "bookings" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <BookingManager />
          </motion.div>
        )}

        {activeTab === "chats" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="space-y-5">
            {conversationId ? <DedicatedChatView conversationId={conversationId} /> : <OwnerChats />}
          </motion.div>
        )}

        {activeTab === "inquiries" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <InquiryManager />
          </motion.div>
        )}

        {activeTab === "complaints" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <ComplaintManager />
          </motion.div>
        )}

        {activeTab === "agreements" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <AgreementManager />
          </motion.div>
        )}

        {activeTab === "verification" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <VerificationPanel />
          </motion.div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The listing will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ListingForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        editData={editData}
      />
    </div>
  );
};

export default OwnerDashboard;
