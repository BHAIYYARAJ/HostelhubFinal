import { Languages, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { supportedLanguages } from "@/i18n";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = supportedLanguages.find((l) => l.code === i18n.language) ?? supportedLanguages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("language.label")}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
      >
        <Languages className="h-4 w-4" />
        {!compact && <span className="hidden sm:inline">{current.native}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {supportedLanguages.map((lng) => (
            <button
              key={lng.code}
              onClick={() => {
                i18n.changeLanguage(lng.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary ${
                lng.code === i18n.language ? "text-primary font-medium" : "text-foreground"
              }`}
            >
              <span>
                {lng.native}
                <span className="ml-2 text-xs text-muted-foreground">{lng.label}</span>
              </span>
              {lng.code === i18n.language && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}