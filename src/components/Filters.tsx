import { useAppStore } from "@/store/useAppStore";

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "boys", label: "Boys" },
  { value: "girls", label: "Girls" },
  { value: "co-ed", label: "Co-ed" },
];

const Filters = () => {
  const { selectedType, setSelectedType, priceRange, setPriceRange } = useAppStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Type pills */}
      {typeOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setSelectedType(opt.value)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-[0.97] ${
            selectedType === opt.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-foreground/20"
          }`}
        >
          {opt.label}
        </button>
      ))}

      {/* Price range */}
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
        <span className="text-xs text-muted-foreground">Max ₹</span>
        <input
          type="range"
          min={3000}
          max={15000}
          step={500}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-24 accent-primary"
        />
        <span className="text-sm font-medium tabular-nums text-foreground">
          {priceRange[1].toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default Filters;
