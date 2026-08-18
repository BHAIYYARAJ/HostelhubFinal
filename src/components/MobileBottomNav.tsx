import { NavLink } from "@/lib/router-compat";
import { Compass, Map, Heart, Sparkles, CalendarCheck, FileText, AlertCircle, LayoutDashboard } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";

const studentItems = [
  { label: "Explore", path: "/", icon: Compass },
  { label: "Map", path: "/map", icon: Map },
  { label: "Saved", path: "/favorites", icon: Heart },
  { label: "Smart Picks", path: "/recommendations", icon: Sparkles },
  { label: "Bookings", path: "/my-bookings", icon: CalendarCheck },
  { label: "Agreements", path: "/my-agreements", icon: FileText },
  { label: "Complaints", path: "/my-complaints", icon: AlertCircle },
];

const ownerItems = [
  { label: "Explore", path: "/", icon: Compass },
  { label: "Map", path: "/map", icon: Map },
  { label: "Dashboard", path: "/owner", icon: LayoutDashboard },
];

export default function MobileBottomNav() {
  const user = useAuthStore((s) => s.user);
  const favorites = useAppStore((s) => s.favorites);

  if (!user || !user.role) return null;

  const items = user.role === "owner" ? ownerItems : studentItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 w-full items-stretch overflow-x-auto px-1">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `relative flex min-w-[52px] flex-1 shrink-0 flex-col items-center justify-center gap-0.5 px-1 text-[9px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="max-w-full truncate">{label}</span>
                {label === "Saved" && favorites.length > 0 && (
                  <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                    {favorites.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
