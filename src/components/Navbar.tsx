import { Link, useLocation, useNavigate } from "@/lib/router-compat";
import { Heart, LogOut, UserCircle, Loader2, Map, FileText, AlertCircle, CalendarCheck, Sparkles, MessageCircle, FileQuestion, Bell } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileProfileButton from "./MobileProfileButton";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const favorites = useAppStore((s) => s.favorites);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between md:h-[72px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">H</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Hostel<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop links — intentionally unchanged */}
        <div className="hidden items-center gap-1 md:flex">
          <Link to="/" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
            {t("nav.explore")}
          </Link>
          <Link to="/map" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/map") ? "text-primary" : "text-muted-foreground"}`}>
            <span className="flex items-center gap-1.5"><Map className="h-4 w-4" />{t("nav.map")}</span>
          </Link>
          <Link to="/favorites" className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/favorites") ? "text-primary" : "text-muted-foreground"}`}>
            <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{t("nav.saved")}{favorites.length > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">{favorites.length}</span>}</span>
          </Link>
          {user?.role === "owner" && (
            <Link to="/owner" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/owner") ? "text-primary" : "text-muted-foreground"}`}>
              {t("nav.dashboard")}
            </Link>
          )}
          {user?.role === "student" && (
            <>
              <Link to="/recommendations" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/recommendations") ? "text-primary" : "text-muted-foreground"}`}>
                <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Smart Picks</span>
              </Link>
              <Link to="/chats" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/chats") ? "text-primary" : "text-muted-foreground"}`}><span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Chats</span></Link>
              <Link to="/my-bookings" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/my-bookings") ? "text-primary" : "text-muted-foreground"}`}>
                <span className="flex items-center gap-1.5"><CalendarCheck className="h-4 w-4" /> Bookings</span>
              </Link>
              <Link to="/my-agreements" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/my-agreements") ? "text-primary" : "text-muted-foreground"}`}>
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> {t("nav.agreements")}</span>
              </Link>
              <Link to="/my-complaints" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/my-complaints") ? "text-primary" : "text-muted-foreground"}`}>
                <span className="flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> {t("nav.complaints")}</span>
              </Link>
              <Link to="/my-inquiries" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${isActive("/my-inquiries") ? "text-primary" : "text-muted-foreground"}`}>
                <span className="flex items-center gap-1.5"><FileQuestion className="h-4 w-4" /> Inquiries</span>
              </Link>
            </>
          )}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-2 md:flex">
          {user?.role === "student" && <Link to="/notifications" aria-label="Notifications" className={`relative rounded-lg p-2 transition-colors hover:bg-secondary ${isActive("/notifications") ? "text-primary" : "text-muted-foreground"}`}><Bell className="h-5 w-5" /></Link>}
          <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {!initialized || loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 transition-colors hover:bg-secondary/80">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[120px] truncate text-sm font-medium text-foreground">{user.name}</span>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">{user.role || "role unavailable"}</span>
              </Link>
              <button onClick={handleLogout} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary" title={t("nav.logout")}>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">{t("nav.login")}</Link>
              <Link to="/signup" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.97]">{t("nav.signup")}</Link>
            </>
          )}
          </div>
        </div>

        {/* Mobile top bar: only logo + profile/login actions. Main navigation is at the bottom. */}
        <div className="flex items-center gap-2 md:hidden">
          {user && initialized && !loading ? <MobileProfileButton /> : (
            <div className="flex items-center gap-1">
              <Link to="/login" className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground">{t("nav.login")}</Link>
              <Link to="/signup" className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">{t("nav.signup")}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
