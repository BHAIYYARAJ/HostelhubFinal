import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Star,
  Building2,
  Clock,
  TrendingUp,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCreateChatConversation } from "@/hooks/useConversations";
import InquiryDialog from "@/components/InquiryDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "@/lib/router-compat";
import { usePresence } from "@/hooks/usePresence";
import { toast } from "sonner";

interface Props {
  ownerName: string;
  ownerId?: string;
  hostelId?: string;
  hostelName?: string;
}

interface OwnerProfile {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  response_rate: number | null;
  avg_response_minutes: number | null;
  owner_rating: number | null;
  owner_review_count: number | null;
}

const formatResponseTime = (mins?: number | null) => {
  if (!mins || mins <= 0) return "—";
  if (mins < 60) return `${mins}m`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
};

const OwnerInfoCard = ({ ownerName, ownerId, hostelId, hostelName }: Props) => {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(!!ownerId);
  const [listingCount, setListingCount] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const isOnline = usePresence(ownerId);
  const navigate = useNavigate();
  const createConversation = useCreateChatConversation();

  useEffect(() => {
    if (!ownerId) return;
    (async () => {
      const [{ data }, { count }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, phone, email, avatar_url, is_verified, response_rate, avg_response_minutes, owner_rating, owner_review_count")
          .eq("id", ownerId)
          .single(),
        supabase
          .from("hostels")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", ownerId),
      ]);
      if (data) setProfile(data as unknown as OwnerProfile);
      setListingCount(count ?? 0);
      setLoading(false);
    })();
  }, [ownerId]);

  const displayName = profile?.full_name || ownerName;
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isVerified = !!profile?.is_verified;
  const isTopRated = (profile?.owner_rating ?? 0) >= 4.5 && (profile?.owner_review_count ?? 0) >= 3;

  const handleChatClick = async () => {
    if (!user) {
      toast.error("Please log in to chat with the owner");
      return;
    }
    if (user.id === ownerId) {
      toast.info("You can't chat with yourself!");
      return;
    }
    if (!ownerId || !hostelId) {
      toast.error("This listing is not ready for chat");
      return;
    }
    try {
      const conversationId = await createConversation(hostelId, ownerId);
      navigate(`/chats/${conversationId}`);
    } catch (error: any) {
      toast.error(error?.message || "Could not start chat");
    }
  };

  const handleInquiryClick = () => {
    if (!user) {
      toast.error("Please log in to send an inquiry");
      return;
    }
    if (user.id === ownerId) {
      toast.info("This is your own listing");
      return;
    }
    setInquiryOpen(true);
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Property Owner</h3>
          {isTopRated && (
            <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <Star className="h-3 w-3 fill-current" /> Top rated
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/20">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{initials}</span>
                  )}
                </div>
                <span
                  title={isOnline ? "Online" : "Offline"}
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-card ${
                    isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-semibold text-foreground">{displayName}</p>
                  {isVerified && (
                    <span title="Verified owner" className="inline-flex">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isVerified ? "Verified owner" : "HostelHub owner"} · {isOnline ? "Online now" : "Offline"}
                </p>
                {(profile?.owner_rating ?? 0) > 0 && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium tabular-nums">{Number(profile?.owner_rating).toFixed(1)}</span>
                    <span className="text-muted-foreground">({profile?.owner_review_count ?? 0})</span>
                  </p>
                )}
              </div>
            </div>

            {/* Trust stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-secondary/40 p-3 text-center">
              <div>
                <Building2 className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-bold tabular-nums text-foreground">{listingCount}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Listings</p>
              </div>
              <div>
                <TrendingUp className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-bold tabular-nums text-foreground">{profile?.response_rate ?? 0}%</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Response</p>
              </div>
              <div>
                <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm font-bold tabular-nums text-foreground">{formatResponseTime(profile?.avg_response_minutes)}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg reply</p>
              </div>
            </div>

            {!showDetails ? (
              <button
                onClick={() => setShowDetails(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" />
                View Owner Details
              </button>
            ) : (
              <div className="mt-4 space-y-3 rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{displayName}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${profile.phone}`} className="text-primary hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                )}
                {profile?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${profile.email}`} className="text-primary hover:underline break-all">
                      {profile.email}
                    </a>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Contact the owner for more details about this property.
                </p>
              </div>
            )}

            {/* Contact actions */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={handleInquiryClick}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 active:scale-[0.97]"
              >
                <Send className="h-4 w-4" /> Contact
              </button>
              <button
                onClick={handleChatClick}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
              >
                <MessageCircle className="h-4 w-4" /> Chat
              </button>
            </div>
          </>
        )}
      </div>

      {/* Inquiry dialog */}
      {ownerId && hostelId && (
        <InquiryDialog
          open={inquiryOpen}
          onClose={() => setInquiryOpen(false)}
          hostelId={hostelId}
          hostelName={hostelName || "this property"}
          ownerId={ownerId}
          ownerName={displayName}
        />
      )}
    </>
  );
};

export default OwnerInfoCard;
