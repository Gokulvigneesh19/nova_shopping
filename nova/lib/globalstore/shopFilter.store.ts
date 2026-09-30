import { create } from "zustand";
import { ProductSort } from "@/features/products/services/product.service";

// Shared between the header (search + filter modal) and the home product listing.
interface ShopFilterStore {
  search: string;
  category: string | null;
  maxPrice: number | null;
  sort?: ProductSort;
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setMaxPrice: (maxPrice: number | null) => void;
  setSort: (sort?: ProductSort) => void;
  /** Resets category, price and sort but keeps the header search. */
  resetFilters: () => void;
  clearFilters: () => void;
}

const initialState = {
  search: "",
  category: null,
  maxPrice: null,
  sort: undefined,
};

const useShopFilterStore = create<ShopFilterStore>((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setSort: (sort) => set({ sort }),
  resetFilters: () => set({ category: null, maxPrice: null, sort: undefined }),
  clearFilters: () => set(initialState),
}));

export default useShopFilterStore;
