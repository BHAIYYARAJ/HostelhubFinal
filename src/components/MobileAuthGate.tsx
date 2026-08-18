import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const MOBILE_QUERY = "(max-width: 767px)";

export default function MobileAuthGate() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile || !initialized || loading) return;
    const publicPaths = ["/login", "/signup"];
    if (publicPaths.includes(location.pathname)) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!user.role) return;
    if (user.role === "owner" && location.pathname.startsWith("/recommendations")) {
      navigate("/owner", { replace: true });
    }
  }, [isMobile, initialized, loading, user, location.pathname, navigate]);

  if (!isMobile || !initialized || loading || user?.role) return null;
  if (location.pathname === "/login" || location.pathname === "/signup") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-6 text-center">
      <div className="max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Account role unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">We couldn't verify whether this account is a student or owner. Please sign in again.</p>
        <button
          onClick={async () => { await logout(); navigate("/login", { replace: true }); }}
          className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Sign in again
        </button>
      </div>
    </div>
  );
}
