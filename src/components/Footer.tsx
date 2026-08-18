import { Link } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  return (
  <footer className="border-t border-border bg-secondary/50">
    <div className="container py-12">
      <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-lg font-bold text-foreground">
              Hostel<span className="text-primary">Hub</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.explore")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">{t("footer.allHostels")}</Link></li>
            <li><Link to="/favorites" className="hover:text-foreground transition-colors">{t("footer.savedHostels")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.account")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/profile" className="hover:text-foreground transition-colors">{t("nav.profile")}</Link></li>
            <li><Link to="/login" className="hover:text-foreground transition-colors">{t("nav.login")}</Link></li>
            <li><Link to="/signup" className="hover:text-foreground transition-colors">{t("nav.signup")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.forOwners")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/signup" className="hover:text-foreground transition-colors">{t("footer.listProperty")}</Link></li>
            <li><Link to="/owner" className="hover:text-foreground transition-colors">{t("footer.ownerDashboard")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.contactUs")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href="https://www.instagram.com/hostelhuboffficial?igsh=dThieGFwdm8zMHg="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.instagram")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">{t("footer.followUs")}</h4>
          <div className="flex gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/hostelhuboffficial?igsh=dThieGFwdm8zMHg="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HostelHub. {t("footer.rights")}
      </div>
    </div>
  </footer>
  );
};

export default Footer;
