import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { geocodeAddress, searchPlaces } from "@/lib/geocode";
import { filterSuggestions } from "@/lib/collegeSuggestions";
import { Loader2, MapPin } from "lucide-react";
import type { Importance, StudentPreference } from "../types";

function ImportanceSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Importance;
  onChange: (v: Importance) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {["Very Low", "Low", "Medium", "High", "Very High"][value - 1]}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Importance)}
        className="w-full accent-primary"
      />
    </div>
  );
}

export default function PreferenceForm({
  initial,
  onSave,
  saving,
}: {
  initial: StudentPreference;
  onSave: (p: StudentPreference) => Promise<void> | void;
  saving?: boolean;
}) {
  const [pref, setPref] = useState<StudentPreference>(initial);
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<{ label: string; lat?: number; lng?: number }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const query = pref.preferred_location ?? "";

  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) {
      setSuggestions(filterSuggestions(q).map((label) => ({ label })));
      return;
    }
    const curated = filterSuggestions(q, 4).map((label) => ({ label }));
    setSuggestions(curated);
    debounceRef.current = setTimeout(async () => {
      const places = await searchPlaces(q, 5);
      setSuggestions([
        ...curated,
        ...places
          .filter((p) => !curated.some((c) => c.label === p.displayName))
          .map((p) => ({ label: p.displayName, lat: p.lat, lng: p.lng })),
      ]);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const patch = <K extends keyof StudentPreference>(k: K, v: StudentPreference[K]) =>
    setPref((prev) => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loc = (pref.preferred_location ?? "").trim();
    if (!loc) {
      toast.error("Preferred location / college is required");
      return;
    }
    if (pref.budget_min < 0 || pref.budget_max <= pref.budget_min) {
      toast.error("Enter a valid budget range");
      return;
    }
    let next = pref;
    const q = loc;
    if (q && (pref.preferred_lat == null || pref.preferred_lng == null)) {
      setLocating(true);
      const geo = await geocodeAddress(q);
      setLocating(false);
      if (!geo) {
        toast.error("Couldn't find that college or area — try a more specific name");
        return;
      }
      next = { ...pref, preferred_lat: geo.lat, preferred_lng: geo.lng };
      setPref(next);
    }
    await onSave(next);
    toast.success("Preferences saved");
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="relative md:col-span-2">
          <Label htmlFor="preferred-location">
            Preferred Location / College <span className="text-destructive">*</span>
          </Label>
          <Input
            id="preferred-location"
            required
            autoComplete="off"
            value={pref.preferred_location ?? ""}
            placeholder="City, area or college — e.g. MIT-WPU Pune, Kothrud"
            onFocus={() => setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
            onChange={(e) =>
              setPref((p) => ({
                ...p,
                preferred_location: e.target.value,
                preferred_lat: null,
                preferred_lng: null,
              }))
            }
          />
          {showSuggest && suggestions.length > 0 && (
            <ul
              role="listbox"
              aria-label="Location suggestions"
              className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg"
            >
              {suggestions.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      setPref((p) => ({
                        ...p,
                        preferred_location: s.label,
                        preferred_lat: s.lat ?? null,
                        preferred_lng: s.lng ?? null,
                      }));
                      setShowSuggest(false);
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
            {pref.preferred_lat != null
              ? "Location pinned — hostels are ranked by real distance from here"
              : "We'll pin this on the map and rank hostels by real distance from it"}
          </p>
        </div>
        <div>
          <Label>Search radius (km)</Label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={Math.max(50, pref.preferred_radius_km || 50)}
            onChange={(e) => patch("preferred_radius_km", Number(e.target.value))}
          >
            {[50, 75, 100, 150, 200, 300].map((km) => (
              <option key={km} value={km}>
                {km} km
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Only hostels inside this exact radius are shown, and the map circle matches it.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Budget min (₹/month)</Label>
          <Input
            type="number"
            min={0}
            value={pref.budget_min}
            onChange={(e) => patch("budget_min", Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Budget max (₹/month)</Label>
          <Input
            type="number"
            min={0}
            value={pref.budget_max}
            onChange={(e) => patch("budget_max", Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Preferred distance (km)</Label>
          <Input
            type="number"
            min={0}
            step={0.5}
            value={pref.preferred_distance_km}
            onChange={(e) => patch("preferred_distance_km", Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Room type</Label>
          <Select value={pref.room_type} onValueChange={(v) => patch("room_type", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="triple">Triple</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Food preference</Label>
          <Select value={pref.food_preference} onValueChange={(v) => patch("food_preference", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="veg">Vegetarian</SelectItem>
              <SelectItem value="non-veg">Non-vegetarian</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Gender preference</Label>
          <Select value={pref.gender_preference} onValueChange={(v) => patch("gender_preference", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="boys">Boys</SelectItem>
              <SelectItem value="girls">Girls</SelectItem>
              <SelectItem value="co-ed">Co-ed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Room sharing</Label>
          <Select value={pref.sharing_preference} onValueChange={(v) => patch("sharing_preference", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Study environment</Label>
          <Select value={pref.study_environment} onValueChange={(v) => patch("study_environment", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="quiet">Quiet</SelectItem>
              <SelectItem value="social">Social</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-border bg-secondary/30 p-4 md:grid-cols-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Wi-Fi required</Label>
          <Switch checked={pref.wifi_required} onCheckedChange={(v) => patch("wifi_required", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Laundry required</Label>
          <Switch checked={pref.laundry_required} onCheckedChange={(v) => patch("laundry_required", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Parking required</Label>
          <Switch checked={pref.parking_required} onCheckedChange={(v) => patch("parking_required", v)} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          How important is each factor?
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <ImportanceSlider label="Safety" value={pref.importance_safety}
            onChange={(v) => patch("importance_safety", v)} />
          <ImportanceSlider label="Budget" value={pref.importance_budget}
            onChange={(v) => patch("importance_budget", v)} />
          <ImportanceSlider label="Distance" value={pref.importance_distance}
            onChange={(v) => patch("importance_distance", v)} />
          <ImportanceSlider label="Facilities" value={pref.importance_facility}
            onChange={(v) => patch("importance_facility", v)} />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving || locating}>
          {saving || locating ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}