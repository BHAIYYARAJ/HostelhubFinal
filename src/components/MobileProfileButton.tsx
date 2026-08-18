import { useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { LogOut, UserCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function MobileProfileButton() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex max-w-[170px] items-center gap-2 rounded-xl bg-secondary px-2.5 py-1.5 text-left"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <UserCircle className="h-7 w-7 shrink-0 text-primary" />
        <span className="min-w-0">
          <span className="block max-w-[105px] truncate text-xs font-semibold text-foreground">{user.name || "User"}</span>
          <span className="block text-[9px] font-semibold uppercase tracking-wide text-primary">{user.role || "Role unavailable"}</span>
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close profile menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xl">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              <UserCircle className="h-4 w-4" /> Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
