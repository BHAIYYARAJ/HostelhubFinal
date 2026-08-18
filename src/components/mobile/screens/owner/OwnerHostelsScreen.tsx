import { useState } from "react";
import { Building2, Eye, Loader2, Pencil, Plus, Star } from "lucide-react";

import { AppHeader, HeaderIconButton } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppButton, AppCard, EmptyState } from "@/components/mobile/MobileKit";
import ListingForm from "@/components/owner/ListingForm";
import { useOwnerHostels, type DbHostel } from "@/hooks/useHostels";
import { useAuthStore } from "@/store/useAuthStore";

export function OwnerHostelsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: hostels, isLoading } = useOwnerHostels(user?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DbHostel | null>(null);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <AppScreen>
      <AppHeader
        title="My Hostels"
        subtitle={`${hostels?.length ?? 0} listings`}
        actions={
          <HeaderIconButton label="Add hostel" onClick={openNew}>
            <Plus className="h-[22px] w-[22px]" />
          </HeaderIconButton>
        }
      />

      <ScreenSection className="pb-8">
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !hostels?.length ? (
          <EmptyState
            icon={Building2}
            title="No listings yet"
            body="Add your first hostel to start receiving booking requests."
            action={<AppButton onClick={openNew}>Add a hostel</AppButton>}
          />
        ) : (
          <div className="space-y-4">
            {hostels.map((h) => (
              <AppCard key={h.id} padded={false}>
                <div className="flex gap-3 p-3">
                  <img
                    src={h.images?.[0]}
                    alt={h.name}
                    className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold tracking-tight text-foreground">
                      {h.name}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {h.location}, {h.city}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[12px] font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {h.views ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {Number(h.rating ?? 0).toFixed(1)}
                      </span>
                      <span>₹{Number(h.price).toLocaleString("en-IN")}/mo</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-app-hairline border-t border-app-hairline">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(h);
                      setFormOpen(true);
                    }}
                    className="tap flex items-center justify-center gap-2 py-3 text-[13px] font-bold text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <a
                    href={`/hostel/${h.id}`}
                    className="tap flex items-center justify-center gap-2 py-3 text-[13px] font-bold text-primary"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </a>
                </div>
              </AppCard>
            ))}
          </div>
        )}
      </ScreenSection>

      <ListingForm open={formOpen} onClose={() => setFormOpen(false)} editData={editing} />
    </AppScreen>
  );
}
