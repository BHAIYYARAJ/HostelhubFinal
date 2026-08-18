import {
  BarChart3,
  Building2,
  CalendarCheck,
  Home,
  LayoutDashboard,
  MessageCircle,
  MessageSquareWarning,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NavLink } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

type Tab = { label: string; to: string; icon: LucideIcon; end?: boolean };

const studentTabs: Tab[] = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "Explore", to: "/map", icon: Search },
  { label: "Smart", to: "/recommendations", icon: Sparkles },
  { label: "Bookings", to: "/my-bookings", icon: CalendarCheck },
  { label: "Profile", to: "/profile", icon: User },
];

const ownerTabs: Tab[] = [
  { label: "Dashboard", to: "/owner", icon: LayoutDashboard, end: true },
  { label: "Hostels", to: "/owner/hostels", icon: Building2 },
  { label: "Bookings", to: "/owner/bookings", icon: CalendarCheck },
  { label: "Chats", to: "/owner/chats", icon: MessageCircle },
  { label: "Issues", to: "/owner/complaints", icon: MessageSquareWarning },
  { label: "Analytics", to: "/owner/analytics", icon: BarChart3 },
];

export function TabBar({
  variant = "student",
}: {
  variant?: "student" | "owner";
}) {
  const tabs = variant === "owner" ? ownerTabs : studentTabs;

  return (
    <nav className="glass-bar fixed inset-x-0 bottom-0 z-50 border-t border-app-hairline pb-safe shadow-app-nav">
      <ul className="flex h-[4.25rem] items-stretch">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "tap flex h-full flex-col items-center justify-center gap-1 pt-1",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid h-8 w-14 place-items-center rounded-2xl transition-colors",
                      isActive && "bg-coral-light",
                    )}
                  >
                    <tab.icon
                      className="h-[22px] w-[22px]"
                      strokeWidth={isActive ? 2.6 : 2}
                    />
                  </span>

                  <span className="text-[10px] font-semibold tracking-tight">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}