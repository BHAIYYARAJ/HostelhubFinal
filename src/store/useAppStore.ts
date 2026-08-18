import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  userLocation: [number, number] | null;
  setUserLocation: (loc: [number, number] | null) => void;
}

export const useAppStore = create<AppState>()(
  persist<AppState>(
    (set) => ({
  favorites: [],
  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((f) => f !== id)
        : [...state.favorites, id],
    })),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  selectedCity: "All Cities",
  setSelectedCity: (city) => set({ selectedCity: city }),
  priceRange: [0, 15000],
  setPriceRange: (range) => set({ priceRange: range }),
  selectedType: "all",
  setSelectedType: (type) => set({ selectedType: type }),
  userLocation: null,
  setUserLocation: (loc) => set({ userLocation: loc }),
}),
    {
      name: "hostelhub-app",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : window.localStorage,
      ),
      partialize: (state) =>
        ({ favorites: state.favorites, selectedCity: state.selectedCity }) as AppState,
    },
  ),
);
