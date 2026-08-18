import { useState } from "react";
import {
  Bot,
  Building2,
  CalendarCheck,
  FileText,
  Globe,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  MessageCircle,
  FileQuestion,
  Bell,
  ShieldCheck,
  SlidersHorizontal,
  User,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppButton, EmptyState, ListGroup, ListRow } from "@/components/mobile/MobileKit";
import { ProfileEditSheet } from "@/components/mobile/sheets/ProfileEditSheet";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useNavigate } from "@/lib/router-compat";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const favorites = useAppStore((s) => s.favorites);
  const { data: isAdmin } = useIsAdmin() as { data?: boolean };
  const [editOpen, setEditOpen] = useState(false);

  if (!user) {
    return (
      <AppScreen>
        <AppHeader title="Profile" />
        <EmptyState
          icon={User}
          title="You're not signed in"
          body="Sign in to manage bookings, saved stays and agreements."
          action={
            <div className="flex w-full flex-col gap-3">
              <AppButton to="/login">Sign in</AppButton>
              <AppButton to="/signup" variant="secondary">
                Create account
              </AppButton>
            </div>
          }
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader title="Profile" />

      <ScreenSection>
        <div className="flex items-center gap-4 rounded-3xl bg-app-surface p-4 shadow-app-card">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-primary text-[22px] font-extrabold text-primary-foreground">
            {(user.name || user.email || "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[18px] font-extrabold tracking-tight text-foreground">
              {user.name || "HostelHub user"}
            </p>
            <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
            <span className="mt-1.5 inline-block rounded-full bg-coral-light px-2.5 py-0.5 text-[11px] font-bold capitalize text-primary">
              {user.role ?? "student"}
            </span>
          </div>
        </div>
      </ScreenSection>

      {user.role === "owner" && (
        <ScreenSection title="Owner">
          <ListGroup>
            <ListRow icon={LayoutDashboard} title="Owner dashboard" to="/owner" />
            <ListRow icon={Building2} title="My hostels" to="/owner/hostels" />
            <ListRow icon={CalendarCheck} title="Booking requests" to="/owner/bookings" />
            <ListRow icon={MessageCircle} title="Chats" subtitle="Private student conversations" to="/owner/chats" />
            <ListRow icon={MessageSquareWarning} title="Inquiries" subtitle="Formal student inquiries" to="/owner/inquiries" />
            <ListRow icon={FileText} title="Agreements & payments" to="/owner/agreements" />
            <ListRow icon={ShieldCheck} title="Owner verification" to="/owner/verification" />
          </ListGroup>
        </ScreenSection>
      )}

      <ScreenSection title="Account">
        <ListGroup>
          <ListRow
            icon={UserCog}
            title="Edit profile"
            subtitle="Name, phone and photo"
            onClick={() => setEditOpen(true)}
          />
        </ListGroup>
      </ScreenSection>

      <ScreenSection title="Activity">
        <ListGroup>
          <ListRow
            icon={Heart}
            title="Saved hostels"
            subtitle={`${favorites.length} shortlisted`}
            to="/favorites"
          />
          <ListRow icon={CalendarCheck} title="My bookings" to="/my-bookings" />
          <ListRow icon={MessageCircle} title="Chats" subtitle="Conversations with owners" to="/chats" />
          <ListRow icon={FileQuestion} title="My inquiries" subtitle="Formal inquiries to owners" to="/my-inquiries" />
          <ListRow icon={Bell} title="Notifications" subtitle="Booking, inquiry and chat updates" to="/notifications" />
          <ListRow icon={FileText} title="Agreements" to="/my-agreements" />
          <ListRow icon={MessageSquareWarning} title="My complaints" to="/my-complaints" />
        </ListGroup>
      </ScreenSection>

      <ScreenSection title="Personalisation">
        <ListGroup>
          <ListRow icon={SlidersHorizontal} title="Smart Picks preferences" to="/preferences" />
          <ListRow icon={Bot} title="AI Assistant" to="/assistant" />
          <ListRow icon={Globe} title="Compare hostels" to="/compare" />
        </ListGroup>
      </ScreenSection>

      {isAdmin && (
        <ScreenSection title="Admin">
          <ListGroup>
            <ListRow icon={ShieldCheck} title="Verification requests" to="/admin/verification" />
          </ListGroup>
        </ScreenSection>
      )}

      <ScreenSection className="pb-8">
        <ListGroup>
          <ListRow
            icon={LogOut}
            title="Log out"
            danger
            trailing={<span />}
            onClick={async () => {
              await logout();
              toast.success("Signed out");
              navigate("/");
            }}
          />
        </ListGroup>
      </ScreenSection>

      <ProfileEditSheet open={editOpen} onOpenChange={setEditOpen} />
    </AppScreen>
  );
}
