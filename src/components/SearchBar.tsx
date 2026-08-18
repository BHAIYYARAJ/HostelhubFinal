import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cities } from "@/lib/constants";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const SearchBar = () => {
  const { searchQuery, setSearchQuery, selectedCity, setSelectedCity } = useAppStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const { t } = useTranslation();

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(localQuery), 300);
    return () => clearTimeout(t);
  }, [localQuery, setSearchQuery]);

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-2 shadow-card transition-shadow hover:shadow-card-hover md:p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
        {/* Search input */}
        <div className="flex flex-1 items-center gap-3 px-3 py-2">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-border md:block" />

        {/* City picker */}
        <div className="flex items-center gap-3 px-3 py-2">
          <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none md:w-auto"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]">
          <Search className="h-4 w-4" />
          {t("search.button")}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
