import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ComparisonState {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  canAdd: (id: string) => boolean;
}

export const MAX_COMPARE = 4;

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const cur = get().ids;
        if (cur.includes(id)) {
          set({ ids: cur.filter((x) => x !== id) });
        } else if (cur.length < MAX_COMPARE) {
          set({ ids: [...cur, id] });
        }
      },
      clear: () => set({ ids: [] }),
      canAdd: (id) => get().ids.includes(id) || get().ids.length < MAX_COMPARE,
    }),
    { name: "aphr-comparison" }
  )
);